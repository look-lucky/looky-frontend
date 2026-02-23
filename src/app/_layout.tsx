import { NetworkErrorProvider } from "@/src/shared/contexts/network-error-context";
import { TabBarProvider } from "@/src/shared/contexts/tab-bar-context";
import { AuthProvider } from "@/src/shared/lib/auth";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "react-native-reanimated";
import { useAuth } from "../shared/lib/auth";
import { useGetMyStoreClaims } from "@/src/api/store-claim";

// 점주용 앱 import
import ShopOwnerApp from "@/src/app/(shopowner)/ShopOwnerNavigator";
import PendingApprovalScreen from "@/src/app/(shopowner)/auth/pending-approval";

SplashScreen.preventAutoHideAsync();


// 👇 새로운 컴포넌트: userType 체크
function AppContent() {
  const { userType, isLoading: authLoading, isAuthenticated } = useAuth();

  const isOwner = isAuthenticated && userType === 'ROLE_OWNER';

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

    return <ShopOwnerApp />;
  }

  // 👇 학생 또는 미로그인 시 기존 Expo Router 흐름
  return (
    <TabBarProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="landing" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="signin" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </TabBarProvider>
  );
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