import LookyLogo from "@/assets/images/logo/looky-logo.svg";
import { checkUsernameAvailability, useSend, useVerify } from "@/src/api/auth";
import { AppButton } from "@/src/shared/common/app-button";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useSignupStore } from "@/src/shared/stores/signup-store";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Gray, Owner, System, Text as TextColors } from "@/src/shared/theme/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  KeyboardAvoidingView,
  Platform,
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

  // API 훅
  const sendEmailMutation = useSend();
  const verifyEmailMutation = useVerify();

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
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(295);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sendCodeMessage, setSendCodeMessage] = useState("");
  const sendCodeMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const isStudent = userType === "student";
  const primaryColor = userType === "owner" ? Owner.primary : Brand.primary;

  const isPasswordValid = (pw: string) =>
    /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,20}$/.test(pw);

  // 타이머 로직 - 실제 만료 시간 기반으로 계산
  useEffect(() => {
    if (!isCodeSent || !expiryTime || isEmailVerified) return;
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimer(remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isCodeSent, expiryTime, isEmailVerified]);

  // AppState 변경 감지 - 앱이 다시 활성화될 때 타이머 재계산
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && expiryTime && !isEmailVerified) {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
        setTimer(remaining);
      }
    });
    return () => { subscription.remove(); };
  }, [expiryTime, isEmailVerified]);

  // 재발송 쿨다운 타이머
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // 인라인 메시지 30초 후 자동 제거
  const showSendCodeMessage = useCallback((message: string) => {
    if (sendCodeMessageTimerRef.current) {
      clearTimeout(sendCodeMessageTimerRef.current);
    }
    setSendCodeMessage(message);
    sendCodeMessageTimerRef.current = setTimeout(() => {
      setSendCodeMessage("");
    }, 30000);
  }, []);

  useEffect(() => {
    return () => {
      if (sendCodeMessageTimerRef.current) {
        clearTimeout(sendCodeMessageTimerRef.current);
      }
    };
  }, []);

  // 타이머 포맷 (MM:SS)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 폼 유효성 검사
  const isFormValid = () => {
    if (!userType) return false;

    const commonValid =
      birthYear.length === 4 &&
      birthMonth.length >= 1 &&
      birthDay.length >= 1 &&
      username.length >= 4 &&
      isUsernameChecked &&
      isPasswordValid(password) &&
      password === passwordConfirm;

    if (isStudent) {
      return commonValid && nickname.length >= 2 && nickname.length <= 10;
    } else {
      // 점주: 이메일 인증 필수
      return commonValid && isEmailVerified;
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

    try {
      await sendEmailMutation.mutateAsync({
        data: { email }
      });
      const now = Date.now();
      const expiry = now + 300000; // 5분
      setIsCodeSent(true);
      setExpiryTime(expiry);
      setTimer(300);
      setResendCooldown(5);
      setEmailCode("");
      showSendCodeMessage("인증번호가 발송되었습니다.");
    } catch (error: any) {
      console.error("이메일 발송 실패:", error);
      showSendCodeMessage(error?.message || "인증번호 발송에 실패했습니다.");
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!email || !emailCode) return;

    if (timer <= 0) {
      showSendCodeMessage("인증 시간이 만료되었습니다. 인증번호를 다시 요청해주세요.");
      return;
    }

    try {
      await verifyEmailMutation.mutateAsync({
        data: {
          email,
          code: emailCode
        }
      });
      setIsEmailVerified(true);
      showSendCodeMessage("이메일 인증이 완료되었습니다.");
    } catch (error: any) {
      console.error("이메일 인증 실패:", error);
      showSendCodeMessage(error?.message || "인증번호가 일치하지 않습니다.");
    }
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
        <ArrowLeft onPress={() => router.canGoBack() ? router.back() : router.replace("/auth")} />
      </View>

      {/* Top Content */}
      <View style={styles.topContent}>
        <ThemedText style={styles.subtitle}>우리대학 제휴혜택이 궁금할 땐?</ThemedText>
        <LookyLogo width={169} height={57} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? rs(20) : 0}
      >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
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
                  onChangeText={(text) => {
                    const num = parseInt(text, 10);
                    if (text === "" || isNaN(num)) {
                      setBirthMonth(text);
                    } else {
                      setBirthMonth(String(Math.min(num, 12)));
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  style={styles.birthInput}
                  placeholder="DD"
                  placeholderTextColor={TextColors.placeholder}
                  value={birthDay}
                  onChangeText={(text) => {
                    const num = parseInt(text, 10);
                    if (text === "" || isNaN(num)) {
                      setBirthDay(text);
                    } else {
                      setBirthDay(String(Math.min(num, 31)));
                    }
                  }}
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
                        { backgroundColor: usernameAvailable === true ? Brand.primary : (username ? primaryColor : Gray.gray5) }
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
                        { backgroundColor: usernameAvailable === true ? Brand.primary : (username ? primaryColor : Gray.gray5) }
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

                {/* 이메일 인증 */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputRow}>
                    <View style={[styles.inputContainer, styles.inputFlex]}>
                      <TextInput
                        style={styles.input}
                        placeholder="이메일"
                        placeholderTextColor={TextColors.placeholder}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!isEmailVerified}
                      />
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.emailButton,
                        { backgroundColor: email && !isEmailVerified && resendCooldown <= 0 && !sendEmailMutation.isPending ? Owner.primary : Gray.gray5 },
                      ]}
                      onPress={handleRequestEmailCode}
                      disabled={!email || isEmailVerified || resendCooldown > 0 || sendEmailMutation.isPending}
                    >
                      <ThemedText style={styles.smallButtonText}>
                        {sendEmailMutation.isPending ? "발송 중..." : resendCooldown > 0 ? `재발송 (${resendCooldown}초)` : isCodeSent ? "인증번호 재발송" : "인증번호 받기"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>

                  {/* 인라인 발송 메시지 */}
                  {sendCodeMessage !== "" && (
                    <ThemedText style={styles.inlineMessage}>
                      {sendCodeMessage}
                    </ThemedText>
                  )}

                  {/* 인증번호 입력 */}
                  {isCodeSent && !isEmailVerified && (
                    <View style={styles.inputRow}>
                      <View style={[styles.inputContainer, styles.inputFlex]}>
                        <TextInput
                          style={styles.input}
                          placeholder="인증번호"
                          placeholderTextColor={TextColors.placeholder}
                          value={emailCode}
                          onChangeText={setEmailCode}
                          keyboardType="number-pad"
                          maxLength={6}
                          editable={timer > 0}
                        />
                        <ThemedText style={[styles.timerText, timer <= 0 && styles.timerExpired]}>
                          {formatTimer(timer)}
                        </ThemedText>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.emailButton,
                          { backgroundColor: emailCode && timer > 0 ? Owner.primary : Gray.gray5 },
                        ]}
                        onPress={handleVerifyEmailCode}
                        disabled={!emailCode || timer <= 0}
                      >
                        <ThemedText style={styles.smallButtonText}>
                          확인
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* 인증 완료 메시지 */}
                  {isEmailVerified && (
                    <View style={styles.successMessage}>
                      <ThemedText style={styles.ownerSuccessText}>
                        이메일 인증이 완료되었습니다
                      </ThemedText>
                    </View>
                  )}
                </View>

                {/* TODO: 휴대폰 인증 (백엔드 API 구현 후 활성화) */}
                {/* <View style={styles.inputGroup}>
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
                      onPress={() => {}}
                      disabled={!phone}
                    >
                      <ThemedText style={styles.smallButtonText}>
                        {phoneCode ? "확인" : "인증요청"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View> */}
              </>
            )}

            {/* ============================================ */}
            {/* 공통 필드: 비밀번호 */}
            {/* ============================================ */}

            {/* 비밀번호 */}
            <View style={styles.inputGroup}>
              <View style={[
                styles.inputContainer,
                password.length > 0 && isPasswordValid(password) && styles.inputSuccess,
                password.length > 0 && !isPasswordValid(password) && styles.inputError,
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호"
                  placeholderTextColor={TextColors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  maxLength={20}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 150);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <EyeOffIcon color={Gray.gray5} />
                </TouchableOpacity>
              </View>
              {password.length > 0 && !isPasswordValid(password) && (
                <ThemedText style={styles.errorText}>
                  비밀번호는 영어, 숫자, 특수문자를 포함한 8자~20자 이내로 입력해주세요
                </ThemedText>
              )}
              {password.length === 0 && (
                <ThemedText style={styles.hintText}>
                  영어, 숫자, 특수문자를 포함한 8~20자 이내로 입력해주세요
                </ThemedText>
              )}
            </View>

            {/* 비밀번호 확인 */}
            <View style={styles.inputGroup}>
              <View style={[
                styles.inputContainer,
                passwordConfirm.length > 0 && password === passwordConfirm && isPasswordValid(password) && styles.inputSuccess,
                passwordConfirm.length > 0 && password !== passwordConfirm && styles.inputError,
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 확인"
                  placeholderTextColor={TextColors.placeholder}
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  secureTextEntry={!showPasswordConfirm}
                  autoCapitalize="none"
                  maxLength={20}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 150);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  style={styles.eyeIcon}
                >
                  <EyeOffIcon color={Gray.gray5} />
                </TouchableOpacity>
              </View>
              {passwordConfirm.length > 0 && password === passwordConfirm && isPasswordValid(password) && (
                <ThemedText style={styles.successText}>
                  비밀번호가 일치합니다
                </ThemedText>
              )}
              {passwordConfirm.length > 0 && password !== passwordConfirm && (
                <ThemedText style={styles.errorText}>
                  비밀번호가 일치하지 않습니다
                </ThemedText>
              )}
            </View>
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>

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
  inputRow: {
    flexDirection: "row",
    gap: rs(8),
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
  inputFlex: {
    flex: 1,
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
  emailButton: {
    flexShrink: 0,
    paddingHorizontal: rs(12),
    borderRadius: rs(8),
    height: rs(40),
    justifyContent: "center",
    alignItems: "center",
  },
  smallButtonText: {
    fontSize: rs(12),
    fontWeight: "700",
    color: Gray.white,
  },
  timerText: {
    fontSize: rs(14),
    color: Owner.primary,
    fontWeight: "600",
  },
  timerExpired: {
    color: System.error,
  },
  inlineMessage: {
    fontSize: rs(12),
    color: TextColors.secondary,
    paddingLeft: rs(4),
  },
  successMessage: {
    paddingVertical: rs(8),
  },
  ownerSuccessText: {
    fontSize: rs(12),
    color: Owner.primary,
    fontWeight: "600",
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
    color: Brand.primary,
    paddingLeft: rs(4),
  },
  hintText: {
    fontSize: rs(10),
    color: Gray.gray5,
    paddingLeft: rs(4),
  },
  inputSuccess: {
    borderColor: Brand.primary,
  },
  inputError: {
    borderColor: System.error,
  },
  bottomContent: {
    paddingTop: rs(16),
  },
});
