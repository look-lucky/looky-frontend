import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Gray, Text } from "@/src/shared/theme/theme";
import { SignupIcons } from "@/assets/images/icons/signup";
import LookyLogo from "@/assets/images/logo/looky-logo.svg";
import { useSocialLogin } from "@/src/shared/lib/auth/use-social-login";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 소셜 로그인 브랜드 공식 색상 (플랫폼 가이드라인 준수)
const SocialColors = {
  kakao: "#FEE500",
  google: "#F2F2F2",
  appleBackground: Gray.white,
  appleBorder: "#DCDCDC",
} as const;

export default function SignInPage() {
  const router = useRouter();
  const { loginWithGoogle, loginWithKakao, loginWithApple, isLoading, loadingProvider } = useSocialLogin();

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      if (result.needsSignup && result.userId != null) {
        router.push({
          pathname: "/auth/sign-up-social-form",
          params: { userId: result.userId, provider: "google" },
        });
      } else {
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
        {router.canGoBack() && (
          <ArrowLeft onPress={() => router.back()} />
        )}
      </View>

      <View style={styles.topContent}>
        <ThemedText
          lightColor={Text.primary}
          style={styles.subtitle}
        >
          우리대학 제휴혜택이 궁금할 땐?
        </ThemedText>
        <LookyLogo width={169} height={57} />
      </View>

      <View style={styles.bottomContent}>
        {/* 루키 시작하기 버튼 */}
        <Pressable
          style={styles.universityButton}
          onPress={() => router.push("/auth/sign-in")}
        >
          <SignupIcons.clover width={20} height={20} />
          <ThemedText lightColor={Gray.white} style={styles.universityButtonText}>
            루키 시작하기
          </ThemedText>
        </Pressable>

        {/* 구분선 */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <ThemedText lightColor={Text.placeholder} style={styles.dividerText}>
            또는
          </ThemedText>
          <View style={styles.divider} />
        </View>

        {/* 소셜 로그인 버튼 */}
        <Pressable
          style={[styles.socialButton, styles.kakaoButton, loadingProvider === "kakao" && styles.disabledButton]}
          onPress={handleKakaoLogin}
          disabled={isLoading}
        >
          <SignupIcons.kakao width={20} height={20} />
          <ThemedText lightColor={Gray.black} style={styles.socialButtonText}>
            카카오로 시작하기
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.socialButton, styles.googleButton, loadingProvider === "google" && styles.disabledButton]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <SignupIcons.google width={20} height={20} />
          <ThemedText lightColor={Gray.black} style={styles.socialButtonText}>
            Google로 시작하기
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.socialButton, styles.appleButton, loadingProvider === "apple" && styles.disabledButton]}
          onPress={handleAppleLogin}
          disabled={isLoading}
        >
          <SignupIcons.apple width={20} height={20} />
          <ThemedText lightColor={Gray.black} style={styles.socialButtonText}>
            Apple로 시작하기
          </ThemedText>
        </Pressable>

        {/* 약관 텍스트 */}
        <ThemedText lightColor={Text.placeholder} style={styles.termsText}>
          가입 시 당사의{" "}
          <ThemedText lightColor={Text.primary} style={styles.termsLink}>
            서비스 이용 약관
          </ThemedText>
          {" "}및{" "}
          <ThemedText lightColor={Text.primary} style={styles.termsLink}>
            개인정보 처리방침
          </ThemedText>
          에 동의하는 것으로 간주됩니다.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
    paddingHorizontal: rs(24),
  },
  header: {
    alignItems: "flex-start",
  },
  topContent: {
    alignItems: "flex-start",
    justifyContent: "center",
    transform: [{ translateY: rs(60) }],
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  bottomContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 40,
    gap: 16,
  },
  universityButton: {
    backgroundColor: Brand.primary,
    borderRadius: 8,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  universityButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Gray.gray4,
  },
  dividerText: {
    fontSize: 14,
  },
  socialButton: {
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
  },
  termsText: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
  termsLink: {
    fontSize: 10,
    fontWeight: "600",
  },
  kakaoButton: {
    backgroundColor: SocialColors.kakao,
  },
  googleButton: {
    backgroundColor: SocialColors.google,
  },
  appleButton: {
    backgroundColor: SocialColors.appleBackground,
    borderWidth: 1,
    borderColor: SocialColors.appleBorder,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
