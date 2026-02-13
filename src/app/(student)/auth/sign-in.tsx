import LookyLogo from "@/assets/images/logo/looky-logo.svg";
import { useLogin } from "@/src/api/auth";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { useAuth } from "@/src/shared/lib/auth";
import { rs } from "@/src/shared/theme/scale";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import type { UserType } from "@/src/shared/lib/auth/token";
import { saveCredentials } from "@/src/shared/lib/auth/token";

// JWT payload 디코딩 함수
function decodeJwtPayload(token: string): { role?: string } | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (e) {
    console.log("[Login] JWT decode failed:", e);
    return null;
  }
}

function EyeOffIcon({ color = "#d5d5d5" }: { color?: string }) {
  return (
    <Svg width={rs(20)} height={rs(20)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1 1l22 22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { handleAuthSuccess } = useAuth();
  const loginMutation = useLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("알림", "아이디와 비밀번호를 입력해주세요.");
      return;
    }

    loginMutation.mutate(
      { data: { username, password } },
      {
        onSuccess: async (res) => {
          console.log("[Login] Response status:", res.status);
          console.log("[Login] Response data:", JSON.stringify(res.data, null, 2));

          if (res.status === 200 && res.data.data?.accessToken) {
            const { accessToken, expiresIn } = res.data.data;
            console.log("[Login] Token received:", accessToken.substring(0, 20) + "...");
            console.log("[Login] ExpiresIn:", expiresIn);

            // JWT에서 role 추출
            const jwtPayload = decodeJwtPayload(accessToken);
            console.log("[Login] JWT payload:", jwtPayload);
            const role = (jwtPayload?.role as UserType) ?? "ROLE_STUDENT";
            console.log("[Login] Role from JWT:", role);

            await handleAuthSuccess(accessToken, expiresIn ?? 3600, role);
            await saveCredentials(username, password);
            console.log("[Login] handleAuthSuccess completed - token should be stored");

            router.replace("/(student)/(tabs)");
          } else {
            console.log("[Login] Failed - invalid response");
            Alert.alert("로그인 실패", "아이디 또는 비밀번호를 확인해주세요.");
          }
        },
        onError: () => {
          Alert.alert("오류", "로그인 중 문제가 발생했습니다.");
        },
      }
    );
  };

  const handleSignup = () => {
    router.push("/auth/sign-up-form");
  };

  const handleFindId = () => {
    router.push("/auth/find-id");
  };

  const handleFindPassword = () => {
    // TODO: 비밀번호 찾기 페이지 구현 필요
    router.push("/auth/find-id");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Header with back button */}
        <View style={styles.header}>
          <ArrowLeft onPress={() => router.canGoBack() ? router.back() : router.replace("/auth")} />
        </View>

        {/* Top content with subtitle and logo */}
        <View style={styles.topContent}>
          <Text style={styles.subtitle}>우리대학 제휴혜택이 궁금할 땐?</Text>
          <LookyLogo width={rs(169)} height={rs(57)} />
        </View>

        {/* Center content with input fields */}
        <View style={styles.centerContent}>
          <View style={styles.inputWrapper}>
            {/* Username input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="아이디"
                placeholderTextColor="#828282"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Password input with eye icon */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor="#828282"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <EyeOffIcon color="#d5d5d5" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Links row */}
          <View style={styles.linksRow}>
            <Pressable onPress={handleSignup}>
              <Text style={styles.linkTextBold}>회원가입</Text>
            </Pressable>
            <View style={styles.linkDivider} />
            <Pressable onPress={handleFindId}>
              <Text style={styles.linkText}>아이디 찾기</Text>
            </Pressable>
            <View style={styles.linkDivider} />
            <Pressable onPress={handleFindPassword}>
              <Text style={styles.linkText}>비밀번호 찾기</Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom content with login button */}
        <View style={styles.bottomContent}>
          <TouchableOpacity
            style={[
              styles.loginButton,
              loginMutation.isPending && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
          >
            <Text style={styles.loginButtonText}>
              {loginMutation.isPending ? "로그인 중..." : "로그인"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: rs(24),
  },
  header: {
    paddingVertical: rs(12),
    alignItems: "flex-start",
  },
  topContent: {
    paddingTop: rs(40),
    gap: rs(4),
  },
  subtitle: {
    fontSize: rs(14),
    fontWeight: "500",
    color: "#000000",
    fontFamily: "Pretendard",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    gap: rs(10),
  },
  inputWrapper: {
    gap: rs(6),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: rs(8),
    paddingHorizontal: rs(16),
    height: rs(40),
  },
  input: {
    flex: 1,
    fontSize: rs(14),
    color: "#272828",
    fontFamily: "Pretendard",
  },
  eyeIcon: {
    padding: rs(4),
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
  },
  linkTextBold: {
    fontSize: rs(14),
    fontWeight: "700",
    color: "#272828",
    fontFamily: "Pretendard",
  },
  linkText: {
    fontSize: rs(12),
    fontWeight: "700",
    color: "#828282",
    fontFamily: "Pretendard",
  },
  linkDivider: {
    width: 1,
    height: rs(21),
    backgroundColor: "#e6e6e6",
  },
  bottomContent: {
    paddingBottom: rs(40),
  },
  loginButton: {
    backgroundColor: "#40ce2b",
    borderRadius: rs(8),
    height: rs(40),
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    fontSize: rs(14),
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "Pretendard",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
});
