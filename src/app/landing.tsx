import { useAuth } from "@/src/shared/lib/auth";
import { rs } from "@/src/shared/theme/scale";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NearDealLogo from "@/assets/images/logo/neardeal-logo.svg";

export default function LandingPage() {
  const router = useRouter();
  const { devSetUserType } = useAuth();

  const handleStudentPress = () => {
    router.replace("/auth/login-main");
  };

  const handleOwnerPress = () => {
    // 점주 모드로 전환 → _layout.tsx에서 ShopOwnerApp 렌더링
    devSetUserType("ROLE_OWNER");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Text style={styles.subTitle}>우리대학 제휴혜택이 궁금할 땐?</Text>
        <NearDealLogo width={216} height={73} />
      </View>

      {/* 개발용 선택 버튼 */}
      <View style={styles.buttonContainer}>
        <Text style={styles.devLabel}>[ DEV MODE ]</Text>
        <TouchableOpacity style={styles.studentButton} onPress={handleStudentPress}>
          <Text style={styles.buttonText}>학생용으로 진입</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ownerButton} onPress={handleOwnerPress}>
          <Text style={styles.buttonText}>점주용으로 진입</Text>
        </TouchableOpacity>
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
    transform: [{ translateY: rs(-60) }],
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    fontFamily: "Pretendard",
    textAlign: "center",
  },
  buttonContainer: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(40),
    gap: rs(12),
  },
  devLabel: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginBottom: rs(4),
  },
  studentButton: {
    backgroundColor: "#34B262",
    paddingVertical: rs(16),
    borderRadius: rs(12),
    alignItems: "center",
  },
  ownerButton: {
    backgroundColor: "#4A90D9",
    paddingVertical: rs(16),
    borderRadius: rs(12),
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
});
