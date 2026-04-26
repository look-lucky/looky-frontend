import * as Sentry from "@sentry/react-native";
import { NetworkErrorProvider } from "@/src/shared/contexts/network-error-context";
import { TabBarProvider } from "@/src/shared/contexts/tab-bar-context";
import { AuthProvider, useAuth } from "@/src/shared/lib/auth";
import { decodeJwtPayload, getToken } from "@/src/shared/lib/auth/token";
import { useFonts } from "expo-font";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { ActivityIndicator, AppState, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useGetMyStoreClaims } from "@/src/api/store-claim";
import { logSessionEnd } from "@/src/shared/lib/analytics";
import "react-native-reanimated";

// 점주용 앱 import
import ShopOwnerApp from "@/src/app/(shopowner)/ShopOwnerNavigator";
import PendingApprovalScreen from "@/src/app/(shopowner)/auth/pending-approval";

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: "https://dc7de4ac2d9548135f767a72c5437d19@o4511273691643904.ingest.us.sentry.io/4511273694003200",
  sendDefaultPii: false,
});


// 👇 새로운 컴포넌트: userType 체크
function AppContent() {
  const { userType, isLoading: authLoading, isAuthenticated } = useAuth();

  const isOwner = isAuthenticated && userType === 'ROLE_OWNER';

  // 체류 시간 추적
  const sessionStartRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isAuthenticated) return;
    sessionStartRef.current = Date.now();
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        if (sessionStartRef.current) {
          const durationSeconds = Math.floor((Date.now() - sessionStartRef.current) / 1000);
          if (durationSeconds > 0) {
            logSessionEnd({
              durationSeconds,
              userType: isOwner ? 'owner' : 'student',
            });
          }
          sessionStartRef.current = null;
        }
      } else if (nextState === 'active') {
        sessionStartRef.current = Date.now();
      }
    });
    return () => subscription.remove();
  }, [isAuthenticated, isOwner]);

  const { data: claimsData, isLoading: claimsLoading } = useGetMyStoreClaims({
    query: { enabled: isOwner },
  });

  const [fontsLoaded] = useFonts({
    "Pretendard-Regular": require("@/assets/font/pretendard/Pretendard-Regular.ttf"),
    "Pretendard-Medium": require("@/assets/font/pretendard/Pretendard-Medium.ttf"),
    "Pretendard-SemiBold": require("@/assets/font/pretendard/Pretendard-SemiBold.ttf"),
    "Pretendard-Bold": require("@/assets/font/pretendard/Pretendard-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded && !authLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoading]);

  if (!fontsLoaded || authLoading) return null;

  // 👇 점주 로그인 시 승인 상태 확인
  if (isOwner) {
    if (claimsLoading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    const claims = (claimsData?.data as any)?.data;
    const hasApproved = claims?.some((c: any) => c.status === 'APPROVED');

    if (!hasApproved) {
      return <PendingApprovalScreen />;
    }

    return (
      <TabBarProvider>
        <ShopOwnerApp />
      </TabBarProvider>
    );
  }

  // 👇 학생 또는 미로그인 시 기존 Expo Router 흐름
  return (
    <TabBarProvider>
      <AuthRedirectGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="landing" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(student)" />
      </Stack>
      <StatusBar style="dark" />
    </TabBarProvider>
  );
}

// 별도 컴포넌트로 분리하여 useSegments 등을 안전하게 사용
function AuthRedirectGuard() {
  const { userType, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && userType === 'ROLE_GUEST') {
      const socialSignupPaths = ['sign-up-social-form', 'sign-up-verify', 'sign-up-owner', 'sign-up-done', 'store-select', 'store-search', 'store-register'];
      const isSocialSignupPage = socialSignupPaths.some((p) => pathname.includes(p));
      if (!isSocialSignupPage) {
        console.log("[AuthRedirectGuard] Redirecting ROLE_GUEST to signup form. Current path:", pathname);
        getToken().then((tokenData) => {
          const sub = tokenData ? decodeJwtPayload(tokenData.accessToken)?.sub : undefined;
          if (sub) {
            router.replace({ pathname: "/auth/sign-up-social-form", params: { userId: sub } });
          } else {
            router.replace("/auth/sign-up-social-form");
          }
        });
      }
    }
  }, [isAuthenticated, userType, pathname]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NetworkErrorProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NetworkErrorProvider>
    </GestureHandlerRootView>
  );
}