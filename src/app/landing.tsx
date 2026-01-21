import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { rs } from "../theme/scale";

import NearDealLogo from "@/assets/images/logo/neardeal-logo.svg";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth/login-main"); // 🔥 핵심
    }, 1000); // 1초

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Title Text */}
        <Text style={styles.subTitle}>우리대학 제휴혜택이 궁금할 땐?</Text>

        {/* Logo */}
        <NearDealLogo width={216} height={73} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: rs(-60) }], // 중앙에서 약간 위로 이동
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    fontFamily: "Pretendard",
    textAlign: "center",
  },
  logo: {
    width: 216,
    height: 73,
  },
});
