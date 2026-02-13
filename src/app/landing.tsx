import { useAuth } from "@/src/shared/lib/auth";
import { decodeJwtPayload, getToken } from "@/src/shared/lib/auth/token";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LookyLogo from "@/assets/images/logo/looky-logo.svg";
import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Gray, System } from "@/src/shared/theme/theme";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.looky.kr";

type HealthStatus = "checking" | "connected" | "failed";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, userType } = useAuth();
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("checking");

  const checkHealth = async () => {
    setHealthStatus("checking");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      setHealthStatus(res.ok ? "connected" : "failed");
    } catch {
      setHealthStatus("failed");
    } finally {
      clearTimeout(timeout);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (healthStatus !== "connected") return;
    if (isLoading) return;

    const timer = setTimeout(async () => {
      const onboardingDone = await AsyncStorage.getItem("onboarding_completed");
      if (!onboardingDone) {
        router.replace("/onboarding");
        return;
      }

      if (!isAuthenticated) {
        router.replace("/auth");
        return;
      }

      if (userType === "ROLE_GUEST") {
        const tokenData = await getToken();
        const payload = tokenData ? decodeJwtPayload(tokenData.accessToken) : null;
        const userId = payload?.sub;
        router.replace({
          pathname: "/auth/sign-up-social-form",
          params: userId ? { userId } : undefined,
        });
        return;
      }

      router.replace("/(student)/(tabs)");
    }, 1000);

    return () => clearTimeout(timer);
  }, [healthStatus, isLoading, isAuthenticated, userType, router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <ThemedText style={styles.subTitle}>
          우리대학 제휴혜택이 궁금할 땐?
        </ThemedText>
        <LookyLogo width={216} height={73} />
      </View>

      <View style={styles.statusBar}>
        <View
          style={[
            styles.dot,
            healthStatus === "connected" && styles.dotConnected,
            healthStatus === "failed" && styles.dotFailed,
            healthStatus === "checking" && styles.dotChecking,
          ]}
        />
        <ThemedText style={styles.statusText}>
          {healthStatus === "checking" && "연결 확인 중..."}
          {healthStatus === "connected" && "연결됨"}
          {healthStatus === "failed" && "연결 실패"}
        </ThemedText>
        {healthStatus === "failed" && (
          <TouchableOpacity onPress={checkHealth}>
            <ThemedText style={styles.retryText}>재시도</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subTitle: {
    fontSize: rs(14),
    fontWeight: "500",
    color: Gray.black,
    textAlign: "center",
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: rs(24),
  },
  dot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
  },
  dotConnected: {
    backgroundColor: Brand.primary,
  },
  dotFailed: {
    backgroundColor: System.error,
  },
  dotChecking: {
    backgroundColor: Gray.gray5,
  },
  statusText: {
    fontSize: rs(12),
    color: Gray.gray6,
  },
  retryText: {
    fontSize: rs(12),
    color: Brand.primary,
  },
});
