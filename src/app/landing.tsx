import { useAuth } from "@/src/shared/lib/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NearDealLogo from "@/assets/images/logo/neardeal-logo.svg";
import { ThemedText } from "@/src/shared/common/themed-text";
import { Gray, System, Brand } from "@/src/shared/theme/theme";
import { rs } from "@/src/shared/theme/scale";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type HealthStatus = "checking" | "connected" | "failed";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });
        setHealthStatus(res.ok ? "connected" : "failed");
      } catch {
        setHealthStatus("failed");
      }
    };

    checkHealth();
  }, []);

  useEffect(() => {
    if (healthStatus === "checking") return;

    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? "/(student)/(tabs)" : "/auth");
    }, 1000);

    return () => clearTimeout(timer);
  }, [healthStatus, router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <ThemedText style={styles.subTitle}>
          우리대학 제휴혜택이 궁금할 땐?
        </ThemedText>
        <NearDealLogo width={216} height={73} />
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
          {healthStatus === "checking" && "서버 연결 확인 중..."}
          {healthStatus === "connected" && "서버 연결됨"}
          {healthStatus === "failed" && "서버 연결 실패"}
        </ThemedText>
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
});
