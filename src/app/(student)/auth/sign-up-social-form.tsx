import LookyLogo from "@/assets/images/logo/looky-logo.svg";
import { useSend, useVerify } from "@/src/api/auth";
import { AppButton } from "@/src/shared/common/app-button";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useAuth } from "@/src/shared/lib/auth";
import { decodeJwtPayload, getToken } from "@/src/shared/lib/auth/token";
import { useSignupStore } from "@/src/shared/stores/signup-store";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Gray, Owner, System, Text as TextColors } from "@/src/shared/theme/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AgreeModal } from "./components/agree-modal";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
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

function RadioButton({
  selected,
  label,
  onPress,
  activeColor = Brand.primary,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
  activeColor?: string;
}) {
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
        {selected && <Circle cx="10" cy="10" r="5" fill={activeColor} />}
      </Svg>
      <ThemedText style={styles.radioLabel}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

export default function SocialSignupFormPage() {
  const router = useRouter();
  const { userId: userIdParam, provider } = useLocalSearchParams<{
    userId: string;
    provider: string;
  }>();
  const { handleLogout, userType } = useAuth();
  const { setSignupFields, userType: storedUserType, gender: storedGender, birthYear: storedBirthYear, birthMonth: storedBirthMonth, birthDay: storedBirthDay, nickname: storedNickname, ownerEmail: storedOwnerEmail } = useSignupStore();

  // URL 파라미터에 userId가 없을 경우(AuthRedirectGuard의 params 없는 리다이렉트) JWT에서 fallback
  const [userId, setUserId] = useState<string | undefined>(userIdParam);
  useEffect(() => {
    if (!userIdParam) {
      getToken().then((tokenData) => {
        if (tokenData) {
          const payload = decodeJwtPayload(tokenData.accessToken);
          if (payload?.sub) {
            setUserId(payload.sub);
          }
        }
      });
    }
  }, [userIdParam]);

  const sendEmailMutation = useSend();
  const verifyEmailMutation = useVerify();

  const [selectedUserType, setSelectedUserType] = useState<UserType>(storedUserType);
  const [gender, setGender] = useState<Gender>(storedGender);
  const [birthYear, setBirthYear] = useState(storedBirthYear);
  const [birthMonth, setBirthMonth] = useState(storedBirthMonth);
  const [birthDay, setBirthDay] = useState(storedBirthDay);

  const [birthTouched, setBirthTouched] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [nicknameTouched, setNicknameTouched] = useState(false);
  const [nicknameFocused, setNicknameFocused] = useState(false);

  // 학생 전용
  const [nickname, setNickname] = useState(storedNickname);

  // 점주 전용
  const [email, setEmail] = useState(storedOwnerEmail);
  const [emailCode, setEmailCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(295);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sendCodeMessage, setSendCodeMessage] = useState("");
  const sendCodeMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [agreeModalVisible, setAgreeModalVisible] = useState(true);

  const isStudent = selectedUserType === "student";
  const primaryColor = selectedUserType === "owner" ? Owner.primary : Brand.primary;

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

  const isBirthValid = () => {
    if (birthYear.length !== 4 || !birthMonth || !birthDay) return false;
    const year = parseInt(birthYear, 10);
    const month = parseInt(birthMonth, 10);
    const day = parseInt(birthDay, 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    if (year < 1900 || year > 2010) return false;
    const birthDate = new Date(year, month - 1, day);
    if (
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day
    ) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (birthDate > today) return false;
    const age14Date = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());
    if (birthDate > age14Date) return false;
    return true;
  };

  const getBirthError = (): string | null => {
    if (!birthTouched && !hasSubmitted) return null;
    if (!birthYear || !birthMonth || !birthDay || birthYear.length !== 4) {
      return '생년월일을 입력해주세요';
    }
    const year = parseInt(birthYear, 10);
    const month = parseInt(birthMonth, 10);
    const day = parseInt(birthDay, 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return '생년월일을 입력해주세요';
    const birthDate = new Date(year, month - 1, day);
    if (
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day
    ) return '존재하지 않는 날짜입니다';
    if (year < 1900 || year > 2010) return '1900~2010년생만 가입 가능합니다';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (birthDate > today) return '미래 날짜는 입력할 수 없습니다';
    const age14Date = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());
    if (birthDate > age14Date) return '만 14세 이상만 가입 가능합니다';
    return null;
  };

  const isNicknameValid = (nick: string) => /^[가-힣a-zA-Z]{2,10}$/.test(nick);

  const isFormValid = () => {
    if (!selectedUserType) return false;
    if (!isBirthValid()) return false;
    if (isStudent) {
      return isNicknameValid(nickname);
    } else {
      return isEmailVerified;
    }
  };

  const handleRequestEmailCode = async () => {
    if (!email) return;
    try {
      await sendEmailMutation.mutateAsync({ data: { email } });
      const now = Date.now();
      const expiry = now + 300000; // 5분
      setIsCodeSent(true);
      setExpiryTime(expiry);
      setTimer(300);
      setResendCooldown(5);
      setEmailCode("");
      showSendCodeMessage("인증번호가 발송되었습니다.");
    } catch (error: any) {
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
      await verifyEmailMutation.mutateAsync({ data: { email, code: emailCode } });
      setIsEmailVerified(true);
      showSendCodeMessage("이메일 인증이 완료되었습니다.");
    } catch (error: any) {
      showSendCodeMessage(error?.message || "인증번호가 일치하지 않습니다.");
    }
  };

  const handleNext = () => {
    setHasSubmitted(true);
    if (!isFormValid() || !selectedUserType) return;

    setSignupFields({
      userType: selectedUserType,
      gender,
      birthYear,
      birthMonth,
      birthDay,
      nickname,
      ownerEmail: email,
      socialUserId: userId ?? "",
      socialProvider: provider ?? "",
    });

    if (selectedUserType === "owner") {
      router.push("/auth/sign-up-owner");
    } else {
      router.push({
        pathname: "/auth/sign-up-verify",
        params: { socialUserId: userId ?? "" },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <AgreeModal
        visible={agreeModalVisible}
        onAgree={() => setAgreeModalVisible(false)}
        onClose={async () => {
          if (userType === "ROLE_GUEST") {
            await handleLogout();
          }
          router.replace("/auth");
        }}
      />
      <View style={styles.header}>
        <ArrowLeft onPress={() => {
          Alert.alert(
            "회원가입 취소",
            "회원가입을 그만두시겠습니까?",
            [
              { text: "계속하기", style: "cancel" },
              {
                text: "그만두기",
                style: "destructive",
                onPress: async () => {
                  if (userType === "ROLE_GUEST") {
                    await handleLogout();
                    router.replace("/auth");
                  } else if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/auth");
                  }
                },
              },
            ]
          );
        }} />
      </View>

      <View style={styles.topContent}>
        <ThemedText style={styles.subtitle}>우리대학 제휴혜택이 궁금할 땐?</ThemedText>
        <LookyLogo width={169} height={57} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 가입 유형 */}
        <View style={styles.fieldGroup}>
          <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
            가입 유형
          </ThemedText>
          <View style={styles.radioGroup}>
            <RadioButton
              selected={selectedUserType === "student"}
              label="대학생"
              onPress={() => setSelectedUserType("student")}
              activeColor={Brand.primary}
            />
            <RadioButton
              selected={selectedUserType === "owner"}
              label="점주"
              onPress={() => setSelectedUserType("owner")}
              activeColor={Owner.primary}
            />
          </View>
        </View>

        {selectedUserType && (
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
                  onBlur={() => setBirthTouched(true)}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                <TextInput
                  style={styles.birthInput}
                  placeholder="MM"
                  placeholderTextColor={TextColors.placeholder}
                  value={birthMonth}
                  onChangeText={(text) => {
                    if (text.length === 2) {
                      const num = parseInt(text, 10);
                      if (!isNaN(num)) {
                        setBirthMonth(String(Math.min(Math.max(num, 1), 12)).padStart(2, "0"));
                        return;
                      }
                    }
                    setBirthMonth(text);
                  }}
                  onBlur={() => {
                    setBirthTouched(true);
                    const num = parseInt(birthMonth, 10);
                    if (birthMonth !== "" && !isNaN(num)) {
                      setBirthMonth(String(Math.min(Math.max(num, 1), 12)).padStart(2, "0"));
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
                    if (text.length === 2) {
                      const num = parseInt(text, 10);
                      if (!isNaN(num)) {
                        setBirthDay(String(Math.min(Math.max(num, 1), 31)).padStart(2, "0"));
                        return;
                      }
                    }
                    setBirthDay(text);
                  }}
                  onBlur={() => {
                    setBirthTouched(true);
                    const num = parseInt(birthDay, 10);
                    if (birthDay !== "" && !isNaN(num)) {
                      setBirthDay(String(Math.min(Math.max(num, 1), 31)).padStart(2, "0"));
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              {getBirthError() !== null && (
                <ThemedText style={styles.errorText}>{getBirthError()}</ThemedText>
              )}
            </View>

            {/* 학생 전용: 닉네임 */}
            {isStudent && (
              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="닉네임 (한글, 영문 2~10자 이내)"
                    placeholderTextColor={TextColors.placeholder}
                    value={nickname}
                    onChangeText={setNickname}
                    maxLength={10}
                    onFocus={() => setNicknameFocused(true)}
                    onBlur={() => {
                      setNicknameFocused(false);
                      setNicknameTouched(true);
                    }}
                  />
                </View>
                {hasSubmitted && nickname.length === 0 && (
                  <ThemedText style={styles.errorText}>닉네임을 입력해주세요</ThemedText>
                )}
                {(hasSubmitted || (!nicknameFocused && nicknameTouched)) && nickname.length > 0 && !isNicknameValid(nickname) && (
                  <ThemedText style={styles.errorText}>닉네임은 한글, 영문을 포함한 2~10자 이내로 입력해주세요</ThemedText>
                )}
              </View>
            )}

            {/* 점주 전용: 이메일 인증 */}
            {!isStudent && (
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
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.bottomContent}>
        <AppButton
          label="다음으로"
          backgroundColor={isFormValid() ? primaryColor : Gray.gray5}
          onPress={handleNext}
          disabled={!isFormValid()}
        />
      </View>
      </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
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
  bottomContent: {
    paddingTop: rs(16),
  },
  errorText: {
    fontSize: rs(10),
    color: System.error,
  },
});
