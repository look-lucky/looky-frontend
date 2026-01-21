import NearDealLogo from "@/assets/images/logo/neardeal-logo.svg";
import { ArrowLeft } from "@/src/components/button/arrow-left";
import { rs } from "@/src/theme/scale";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
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

export default function SignupInfoPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);

  const isFormValid =
    nickname.length >= 2 &&
    nickname.length <= 10 &&
    username.length >= 4 &&
    username.length <= 16 &&
    isUsernameChecked &&
    password.length >= 8 &&
    password.length <= 20 &&
    password === passwordConfirm;

  const handleCheckUsername = () => {
    // TODO: API call to check username availability
    setIsUsernameChecked(true);
  };

  const handleSignup = () => {
    if (isFormValid) {
      // TODO: Implement signup logic
      console.log("Signup with:", { nickname, username, password });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
      </View>

      <View style={styles.topContent}>
        {/* Subtitle */}
        <Text style={styles.subtitle}>우리대학 제휴혜택이 궁금할 땐?</Text>

        {/* Logo */}
        <NearDealLogo width={169} height={57} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Content */}
        <View style={styles.content}>
          {/* 닉네임 입력 */}
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="닉네임 (한글, 영문 2~10자 이내)"
                placeholderTextColor="#828282"
                value={nickname}
                onChangeText={setNickname}
                maxLength={10}
              />
            </View>
          </View>

          {/* 아이디 입력 */}
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="아이디"
                placeholderTextColor="#828282"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setIsUsernameChecked(false);
                }}
                autoCapitalize="none"
                maxLength={16}
              />
              <TouchableOpacity
                style={[
                  styles.smallButton,
                  { backgroundColor: username ? "#d5d5d5" : "#d5d5d5" },
                ]}
                onPress={handleCheckUsername}
                disabled={!username}
              >
                <Text style={styles.smallButtonText}>중복 확인</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.errorText}>
              아이디는 영어, 숫자를 포함한 4~16자 이내로 입력해주세요
            </Text>
          </View>

          {/* 비밀번호 입력 */}
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor="#828282"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                maxLength={20}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <EyeOffIcon color="#d5d5d5" />
              </TouchableOpacity>
            </View>
            <Text style={styles.errorText}>
              비밀번호는 영어, 숫자, 특수문자를 포함한 8자~20자 이내로
              입력해주세요
            </Text>
          </View>

          {/* 비밀번호 확인 입력 */}
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                placeholderTextColor="#828282"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry={!showPasswordConfirm}
                autoCapitalize="none"
                maxLength={20}
              />
              <TouchableOpacity
                onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                style={styles.eyeIcon}
              >
                <EyeOffIcon color="#d5d5d5" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 회원가입 버튼 */}
      <View style={styles.bottomContent}>
        <TouchableOpacity
          style={[
            styles.signupButton,
            { backgroundColor: isFormValid ? "#40ce2b" : "#d5d5d5" },
          ]}
          onPress={handleSignup}
          disabled={!isFormValid}
        >
          <Text style={styles.signupButtonText}>회원가입</Text>
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
    paddingHorizontal: rs(24),
    paddingVertical: rs(12),
    alignItems: "flex-start",
  },
  topContent: {
    paddingHorizontal: rs(24),
    paddingTop: rs(20),
    paddingBottom: rs(30),
    gap: rs(4),
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    fontFamily: "Pretendard",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: rs(24),
  },
  content: {
    gap: rs(6),
  },
  inputGroup: {
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
  smallButton: {
    paddingHorizontal: rs(12),
    paddingVertical: rs(4),
    borderRadius: rs(8),
    height: rs(22),
    justifyContent: "center",
    alignItems: "center",
  },
  smallButtonText: {
    fontSize: rs(12),
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "Pretendard",
  },
  eyeIcon: {
    padding: rs(4),
  },
  errorText: {
    fontSize: rs(10),
    color: "#ff6200",
    fontFamily: "Pretendard",
    paddingLeft: rs(4),
  },
  bottomContent: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(40),
  },
  signupButton: {
    borderRadius: rs(8),
    height: rs(40),
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonText: {
    fontSize: rs(14),
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "Pretendard",
  },
});
