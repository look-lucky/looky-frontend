import NearDealLogo from "@/assets/images/logo/neardeal-logo.svg";
import { ArrowLeft } from "@/src/components/button/arrow-left";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

function EyeOffIcon({ color = "#d5d5d5" }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log("Login with:", username, password);
  };

  const handleSignup = () => {
    router.push("/login-main");
  };

  const handleFindId = () => {
    router.push("/signin-email");
  };

  const handleFindPassword = () => {
    // TODO: Navigate to find password page
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header with back button */}
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
      </View>

      {/* Top content with subtitle and logo */}
      <View style={styles.topContent}>
        <Text style={styles.subtitle}>우리대학 제휴혜택이 궁금할 땐?</Text>
        <NearDealLogo width={169} height={57} />
      </View>

      {/* Center content with input fields */}
      <View style={styles.centerContent}>
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
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>로그인</Text>
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
  header: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  topContent: {
    paddingHorizontal: 24,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    fontFamily: "Pretendard",
    marginBottom: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 40,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#272828",
    fontFamily: "Pretendard",
  },
  eyeIcon: {
    padding: 4,
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  linkTextBold: {
    fontSize: 14,
    fontWeight: "700",
    color: "#272828",
    fontFamily: "Pretendard",
  },
  linkText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#828282",
    fontFamily: "Pretendard",
  },
  linkDivider: {
    width: 1,
    height: 21,
    backgroundColor: "#e6e6e6",
    marginHorizontal: 12,
  },
  bottomContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  loginButton: {
    backgroundColor: "#40ce2b",
    borderRadius: 8,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "Pretendard",
  },
});
