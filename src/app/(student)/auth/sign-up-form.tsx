import NearDealLogo from "@/assets/images/logo/neardeal-logo.svg";
import { checkUsernameAvailability } from "@/src/api/auth";
import { AppButton } from "@/src/shared/common/app-button";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useSignupStore } from "@/src/shared/stores/signup-store";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Gray, Owner, System, Text as TextColors } from "@/src/shared/theme/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

type UserType = "student" | "owner" | null;
type Gender = "male" | "female";

// ============================================
// API Functions (TODO)
// ============================================

// TODO: 이메일 인증 요청 API 연동
async function requestEmailVerification(email: string): Promise<boolean> {
  console.log("requestEmailVerification:", email);
  // TODO: 실제 API 호출로 교체
  // const response = await api.post('/auth/email/send-code', { email });
  // return response.data.success;
  return true;
}

// TODO: 이메일 인증번호 확인 API 연동
async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  console.log("verifyEmailCode:", email, code);
  // TODO: 실제 API 호출로 교체
  // const response = await api.post('/auth/email/verify', { email, code });
  // return response.data.verified;
  return true;
}

// TODO: 휴대폰 인증 요청 API 연동
async function requestPhoneVerification(phone: string): Promise<boolean> {
  console.log("requestPhoneVerification:", phone);
  // TODO: 실제 API 호출로 교체
  // const response = await api.post('/auth/phone/send-code', { phone });
  // return response.data.success;
  return true;
}

// TODO: 휴대폰 인증번호 확인 API 연동
async function verifyPhoneCode(phone: string, code: string): Promise<boolean> {
  console.log("verifyPhoneCode:", phone, code);
  // TODO: 실제 API 호출로 교체
  // const response = await api.post('/auth/phone/verify', { phone, code });
  // return response.data.verified;
  return true;
}

// ============================================
// Icon Components
// ============================================

function EyeOffIcon({ color = Gray.gray5 }: { color?: string }) {
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

// ============================================
// Radio Button Component
// ============================================

type RadioButtonProps = {
  selected: boolean;
  label: string;
  onPress: () => void;
  activeColor?: string;
};

function RadioButton({ selected, label, onPress, activeColor = Brand.primary }: RadioButtonProps) {
  return (
    <TouchableOpacity style={styles.radioButton} onPress={onPress}>
      <Svg width={rs(20)} height={rs(20)} viewBox="0 0 20 20">
        <Circle
          cx="10"
          cy="10"
          r="9"
          stroke={selected ? activeColor : Gray.gray5}
          strokeWidth="1.5"
          fill="none"
        />
        {selected && (
          <Circle cx="10" cy="10" r="5" fill={activeColor} />
        )}
      </Svg>
      <ThemedText style={styles.radioLabel}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

// ============================================
// Main Component
// ============================================

export default function SignupTypePage() {
  const router = useRouter();
  const setSignupFields = useSignupStore((state) => state.setSignupFields);

  // 공통 상태
  const [userType, setUserType] = useState<UserType>(null);
  const [gender, setGender] = useState<Gender>("male");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // 학생 전용 상태
  const [nickname, setNickname] = useState("");

  // 점주 전용 상태
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const isStudent = userType === "student";
  const primaryColor = userType === "owner" ? Owner.primary : Brand.primary;

  // 폼 유효성 검사
  const isFormValid = () => {
    if (!userType) return false;

    const commonValid =
      birthYear.length === 4 &&
      birthMonth.length >= 1 &&
      birthDay.length >= 1 &&
      username.length >= 4 &&
      isUsernameChecked &&
      password.length >= 8 &&
      password === passwordConfirm;

    if (isStudent) {
      return commonValid && nickname.length >= 2 && nickname.length <= 10;
    } else {
      // TODO: 인증 API 연동 후 isEmailVerified && isPhoneVerified 조건 복원
      return commonValid;
    }
  };

  // ============================================
  // API Handlers
  // ============================================

  const handleCheckUsername = async () => {
    if (!username) return;
    console.log("=== 아이디 중복 확인 시작 ===");
    console.log("확인할 아이디:", username);
    try {
      const response = await checkUsernameAvailability({ username });
      console.log("API 응답:", JSON.stringify(response.data, null, 2));
      const available = response.data?.data ?? false;
      console.log("사용 가능 여부:", available);
      setIsUsernameChecked(true);
      setUsernameAvailable(available);
      if (available) {
        console.log("✅ 사용 가능한 아이디입니다");
      } else {
        console.log("❌ 이미 사용중인 아이디입니다");
      }
    } catch (error) {
      console.error("아이디 중복 확인 실패:", error);
      setIsUsernameChecked(false);
      setUsernameAvailable(null);
    }
    console.log("=== 아이디 중복 확인 완료 ===");
  };

  const handleRequestEmailCode = async () => {
    if (!email) return;
    const success = await requestEmailVerification(email);
    // TODO: 성공/실패 피드백 표시
    console.log("이메일 인증 요청:", success);
  };

  const handleVerifyEmailCode = async () => {
    if (!email || !emailCode) return;
    const verified = await verifyEmailCode(email, emailCode);
    setIsEmailVerified(verified);
    // TODO: 인증 성공/실패 피드백 표시
  };

  const handleRequestPhoneCode = async () => {
    if (!phone) return;
    const success = await requestPhoneVerification(phone);
    // TODO: 성공/실패 피드백 표시
    console.log("휴대폰 인증 요청:", success);
  };

  const handleVerifyPhoneCode = async () => {
    if (!phone || !phoneCode) return;
    const verified = await verifyPhoneCode(phone, phoneCode);
    setIsPhoneVerified(verified);
    // TODO: 인증 성공/실패 피드백 표시
  };

  const handleNext = () => {
    if (isFormValid() && userType) {
      // Store에 데이터 저장
      setSignupFields({
        userType,
        gender,
        birthYear,
        birthMonth,
        birthDay,
        nickname,
        username,
        password,
        ownerEmail: email,
        ownerPhone: phone,
      });

      console.log("handleNext userType:", userType);
      if (userType === "owner") {
        try {
          console.log("navigating to /auth/sign-up-owner");
          router.push("/auth/sign-up-owner");
        } catch (e) {
          console.error("navigation error:", e);
        }
      } else {
        router.push("/auth/sign-up-verify");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
      </View>

      {/* Top Content */}
      <View style={styles.topContent}>
        <ThemedText style={styles.subtitle}>우리대학 제휴혜택이 궁금할 땐?</ThemedText>
        <NearDealLogo width={169} height={57} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 가입 유형 */}
        <View style={styles.fieldGroup}>
          <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
            가입 유형
          </ThemedText>
          <View style={styles.radioGroup}>
            <RadioButton
              selected={userType === "student"}
              label="대학생"
              onPress={() => setUserType("student")}
              activeColor={Brand.primary}
            />
            <RadioButton
              selected={userType === "owner"}
              label="점주"
              onPress={() => setUserType("owner")}
              activeColor={Owner.primary}
            />
          </View>
        </View>

        {/* userType 선택 후에만 나머지 폼 표시 */}
        {userType && (
          <>
            {/* 성별 */}
            <View style={styles.fieldGroup}>
              <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
                성별
              </ThemedText>
              <View style={styles.radioGroup}>
                <RadioButton
                  selected={gender === "male"}
                  label="남자"
                  onPress={() => setGender("male")}
                  activeColor={primaryColor}
                />
                <RadioButton
                  selected={gender === "female"}
                  label="여자"
                  onPress={() => setGender("female")}
                  activeColor={primaryColor}
                />
              </View>
            </View>

            {/* 생년월일 */}
            <View style={styles.fieldGroup}>
              <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
                생년월일
              </ThemedText>
              <View style={styles.birthInputGroup}>
                <TextInput
                  style={styles.birthInput}
                  placeholder="YYYY"
                  placeholderTextColor={TextColors.placeholder}
                  value={birthYear}
                  onChangeText={setBirthYear}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                <TextInput
                  style={styles.birthInput}
                  placeholder="MM"
                  placeholderTextColor={TextColors.placeholder}
                  value={birthMonth}
                  onChangeText={setBirthMonth}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  style={styles.birthInput}
                  placeholder="DD"
                  placeholderTextColor={TextColors.placeholder}
                  value={birthDay}
                  onChangeText={setBirthDay}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>

            {/* ============================================ */}
            {/* 학생 전용 필드 */}
            {/* ============================================ */}
            {isStudent && (
              <>
                {/* 닉네임 */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="닉네임 (한글, 영문 2~10자 이내)"
                      placeholderTextColor={TextColors.placeholder}
                      value={nickname}
                      onChangeText={setNickname}
                      maxLength={10}
                    />
                  </View>
                </View>

                {/* 아이디 */}
                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputContainer,
                    usernameAvailable === true && styles.inputSuccess,
                    usernameAvailable === false && styles.inputError,
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="아이디"
                      placeholderTextColor={TextColors.placeholder}
                      value={username}
                      onChangeText={(text) => {
                        setUsername(text);
                        setIsUsernameChecked(false);
                        setUsernameAvailable(null);
                      }}
                      autoCapitalize="none"
                      maxLength={16}
                    />
                    <TouchableOpacity
                      style={[
                        styles.smallButton,
                        { backgroundColor: usernameAvailable === true ? "#22C55E" : (username ? primaryColor : Gray.gray5) }
                      ]}
                      onPress={handleCheckUsername}
                      disabled={!username}
                    >
                      <ThemedText style={styles.smallButtonText}>
                        {usernameAvailable === true ? "확인완료" : "중복 확인"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  {usernameAvailable === true && (
                    <ThemedText style={styles.successText}>
                      사용 가능한 아이디입니다
                    </ThemedText>
                  )}
                  {usernameAvailable === false && (
                    <ThemedText style={styles.errorText}>
                      이미 사용중인 아이디입니다
                    </ThemedText>
                  )}
                  {usernameAvailable === null && (
                    <ThemedText style={styles.hintText}>
                      아이디는 영어, 숫자를 포함한 4~16자 이내로 입력해주세요
                    </ThemedText>
                  )}
                </View>
              </>
            )}

            {/* ============================================ */}
            {/* 점주 전용 필드 */}
            {/* ============================================ */}
            {!isStudent && (
              <>
                {/* 아이디 */}
                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputContainer,
                    usernameAvailable === true && styles.inputSuccess,
                    usernameAvailable === false && styles.inputError,
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="아이디"
                      placeholderTextColor={TextColors.placeholder}
                      value={username}
                      onChangeText={(text) => {
                        setUsername(text);
                        setIsUsernameChecked(false);
                        setUsernameAvailable(null);
                      }}
                      autoCapitalize="none"
                      maxLength={16}
                    />
                    <TouchableOpacity
                      style={[
                        styles.smallButton,
                        { backgroundColor: usernameAvailable === true ? "#22C55E" : (username ? primaryColor : Gray.gray5) }
                      ]}
                      onPress={handleCheckUsername}
                      disabled={!username}
                    >
                      <ThemedText style={styles.smallButtonText}>
                        {usernameAvailable === true ? "확인완료" : "중복 확인"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  {usernameAvailable === true && (
                    <ThemedText style={styles.successText}>
                      사용 가능한 아이디입니다
                    </ThemedText>
                  )}
                  {usernameAvailable === false && (
                    <ThemedText style={styles.errorText}>
                      이미 사용중인 아이디입니다
                    </ThemedText>
                  )}
                  {usernameAvailable === null && (
                    <ThemedText style={styles.hintText}>
                      아이디는 영어, 숫자를 포함한 4~16자 이내로 입력해주세요
                    </ThemedText>
                  )}
                </View>

                {/* 이메일 */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="이메일"
                      placeholderTextColor={TextColors.placeholder}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* 이메일 인증번호 */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="이메일 인증번호"
                      placeholderTextColor={TextColors.placeholder}
                      value={emailCode}
                      onChangeText={setEmailCode}
                      keyboardType="number-pad"
                    />
                    <TouchableOpacity
                      style={[styles.smallButton, { backgroundColor: email ? Owner.primary : Gray.gray5 }]}
                      onPress={emailCode ? handleVerifyEmailCode : handleRequestEmailCode}
                      disabled={!email}
                    >
                      <ThemedText style={styles.smallButtonText}>
                        {emailCode ? "확인" : "인증요청"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 휴대폰 번호 */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="휴대폰 번호"
                      placeholderTextColor={TextColors.placeholder}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* 휴대폰 인증번호 */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="휴대폰 인증번호"
                      placeholderTextColor={TextColors.placeholder}
                      value={phoneCode}
                      onChangeText={setPhoneCode}
                      keyboardType="number-pad"
                    />
                    <TouchableOpacity
                      style={[styles.smallButton, { backgroundColor: phone ? Owner.primary : Gray.gray5 }]}
                      onPress={phoneCode ? handleVerifyPhoneCode : handleRequestPhoneCode}
                      disabled={!phone}
                    >
                      <ThemedText style={styles.smallButtonText}>
                        {phoneCode ? "확인" : "인증요청"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* ============================================ */}
            {/* 공통 필드: 비밀번호 */}
            {/* ============================================ */}

            {/* 비밀번호 */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호"
                  placeholderTextColor={TextColors.placeholder}
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
                  <EyeOffIcon color={Gray.gray5} />
                </TouchableOpacity>
              </View>
              <ThemedText style={styles.errorText}>
                비밀번호는 영어, 숫자, 특수문자를 포함한 8자~20자 이내로 입력해주세요
              </ThemedText>
            </View>

            {/* 비밀번호 확인 */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 확인"
                  placeholderTextColor={TextColors.placeholder}
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
                  <EyeOffIcon color={Gray.gray5} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* 다음으로 버튼 */}
      <View style={styles.bottomContent}>
        <AppButton
          label="다음으로"
          backgroundColor={isFormValid() ? primaryColor : Gray.gray5}
          onPress={handleNext}
          disabled={!isFormValid()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
    padding: rs(20),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rs(8),
  },
  topContent: {
    gap: rs(4),
    marginBottom: rs(24),
  },
  subtitle: {
    fontSize: rs(14),
    color: Gray.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: rs(16),
    paddingBottom: rs(20),
  },
  fieldGroup: {
    gap: rs(8),
  },
  fieldLabel: {
    fontSize: rs(14),
    color: Gray.black,
  },
  radioGroup: {
    flexDirection: "row",
    gap: rs(24),
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  radioLabel: {
    fontSize: rs(14),
    color: Gray.black,
  },
  birthInputGroup: {
    flexDirection: "row",
    gap: rs(8),
  },
  birthInput: {
    flex: 1,
    height: rs(40),
    borderWidth: 1,
    borderColor: Gray.gray4,
    borderRadius: rs(8),
    paddingHorizontal: rs(12),
    fontSize: rs(14),
    color: TextColors.primary,
    textAlign: "center",
  },
  inputGroup: {
    gap: rs(6),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Gray.gray4,
    borderRadius: rs(8),
    paddingHorizontal: rs(16),
    height: rs(40),
  },
  input: {
    flex: 1,
    fontSize: rs(14),
    color: TextColors.primary,
  },
  smallButton: {
    paddingHorizontal: rs(8),
    borderRadius: rs(8),
    height: rs(28),
    minWidth: rs(76),
    justifyContent: "center",
    alignItems: "center",
  },
  smallButtonText: {
    fontSize: rs(12),
    fontWeight: "700",
    color: Gray.white,
  },
  eyeIcon: {
    padding: rs(4),
  },
  errorText: {
    fontSize: rs(10),
    color: System.error,
    paddingLeft: rs(4),
  },
  successText: {
    fontSize: rs(10),
    color: "#22C55E",
    paddingLeft: rs(4),
  },
  hintText: {
    fontSize: rs(10),
    color: Gray.gray5,
    paddingLeft: rs(4),
  },
  inputSuccess: {
    borderColor: "#22C55E",
  },
  inputError: {
    borderColor: System.error,
  },
  bottomContent: {
    paddingTop: rs(16),
  },
});
