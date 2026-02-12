import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { rs } from "@/src/shared/theme/scale";

import { SignupIcons } from "@/assets/images/icons/signup";
import NearDealLogo from "@/assets/images/logo/neardeal-logo.svg";
import { useSocialLogin } from "@/src/shared/lib/auth/use-social-login";

export default function SignInPage() {
  const router = useRouter();
  const { loginWithGoogle, loginWithKakao, loginWithApple, isLoading, loadingProvider } = useSocialLogin();

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      if (result.needsSignup && result.userId != null) {
        // 신규 회원 - 추가 정보 입력 페이지로 이동
        router.push({
          pathname: "/auth/sign-up-social-form",
          params: { userId: result.userId, provider: "google" },
        });
      } else {
        // 기존 회원 - 메인으로 이동
        router.replace("/(student)/(tabs)");
      }
    } else if (result.error !== "cancelled") {
      Alert.alert("로그인 실패", result.error || "다시 시도해주세요.");
    }
  };

  const handleKakaoLogin = async () => {
    const result = await loginWithKakao();
    if (result.success) {
      if (result.needsSignup && result.userId != null) {
        router.push({
          pathname: "/auth/sign-up-social-form",
          params: { userId: result.userId, provider: "kakao" },
        });
      } else {
        router.replace("/(student)/(tabs)");
      }
    } else if (result.error !== "cancelled") {
      Alert.alert("로그인 실패", result.error || "다시 시도해주세요.");
    }
  };

  const handleAppleLogin = async () => {
    const result = await loginWithApple();
    if (result.success) {
      if (result.needsSignup && result.userId != null) {
        router.push({
          pathname: "/auth/sign-up-social-form",
          params: { userId: result.userId, provider: "apple" },
        });
      } else {
        router.replace("/(student)/(tabs)");
      }
    } else if (result.error !== "cancelled") {
      Alert.alert("로그인 실패", result.error || "다시 시도해주세요.");
    }
  };

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
          onPress={() => router.push("/auth/sign-in")}
        >
          <SignupIcons.clover width={20} height={20} />
          <Text style={styles.universityButtonText}>루키 시작하기</Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Buttons */}
        <Pressable
          style={[styles.socialButton, styles.kakaoButton, loadingProvider === "kakao" && styles.disabledButton]}
          onPress={handleKakaoLogin}
          disabled={isLoading}
        >
          <SignupIcons.kakao width={20} height={20} />
          <Text style={styles.socialButtonText}>카카오로 시작하기</Text>
        </Pressable>

        <Pressable
          style={[styles.socialButton, styles.googleButton, loadingProvider === "google" && styles.disabledButton]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <SignupIcons.google width={20} height={20} />
          <Text style={styles.socialButtonText}>Google로 시작하기</Text>
        </Pressable>

        <Pressable
          style={[styles.socialButton, styles.appleButton, loadingProvider === "apple" && styles.disabledButton]}
          onPress={handleAppleLogin}
          disabled={isLoading}
        >
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
  kakaoButton: {
    backgroundColor: "#FEE500",
  },
  googleButton: {
    backgroundColor: "#F2F2F2",
  },
  appleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCDCDC",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
