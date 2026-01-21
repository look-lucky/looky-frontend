import { ArrowLeft } from "@/src/components/button/arrow-left";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { rs } from "../../theme/scale";

import { SignupIcons } from "@/assets/images/icons/signup";
import NearDealLogo from "@/assets/images/logo/neardeal-logo.svg";

export default function SignInPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
      </View>

      <View style={styles.topContent}>
        {/* Subtitle */}
        <Text style={styles.subtitle}>우리대학 제휴혜택이 궁금할 땐?</Text>

        {/* Logo */}
        <NearDealLogo width={169} height={57} />
      </View>

      <View style={styles.bottomContent}>
        {/* University Email Button */}
        <Pressable
          style={styles.universityButton}
          onPress={() => router.push("/auth/login")}
        >
          <SignupIcons.graduation width={20} height={20} />
          <Text style={styles.universityButtonText}>니어딜 시작하기</Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Buttons */}
        <Pressable style={styles.socialButton}>
          <SignupIcons.kakao width={20} height={20} />
          <Text style={styles.socialButtonText}>카카오로 시작하기</Text>
        </Pressable>

        <Pressable style={styles.socialButton}>
          <SignupIcons.google width={20} height={20} />
          <Text style={styles.socialButtonText}>Google로 시작하기</Text>
        </Pressable>

        <Pressable style={styles.socialButton}>
          <SignupIcons.apple width={20} height={20} />
          <Text style={styles.socialButtonText}>Apple로 시작하기</Text>
        </Pressable>

        {/* Terms Text */}
        <Text style={styles.termsText}>
          가입 시 당사의 <Text style={styles.termsLink}>서비스 이용 약관</Text>{" "}
          및 <Text style={styles.termsLink}>개인정보 처리방침</Text>에 동의하는
          것으로 간주됩니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: rs(24),
  },
  header: {
    alignItems: "flex-start",
  },
  topContent: {
    alignItems: "flex-start",
    justifyContent: "center",
    transform: [{ translateY: rs(60) }], // 중앙에서 약간 위로 이동
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    fontFamily: "Pretendard",
  },
  logo: {},
  bottomContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 40,
    gap: 16,
  },
  universityButton: {
    backgroundColor: "#40ce2b",
    borderRadius: 8,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  universityButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "Pretendard",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e6e6e6",
  },
  dividerText: {
    fontSize: 14,
    color: "#828282",
    fontFamily: "Inter",
  },
  socialButton: {
    backgroundColor: "#eeeeee",
    borderRadius: 8,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    fontFamily: "Pretendard",
  },
  buttonIcon: {
    width: 20,
    height: 20,
  },
  termsText: {
    fontSize: 10,
    color: "#828282",
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "Pretendard",
    marginTop: 8,
  },
  termsLink: {
    color: "#000000",
    fontWeight: "600",
  },
});
