import NearDealLogo from "@/assets/images/logo/neardeal-logo.svg";
import { useSend, useVerify } from "@/src/api/auth";
import { AppButton } from "@/src/shared/common/app-button";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useSignupStore } from "@/src/shared/stores/signup-store";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Gray, Owner, System, Text as TextColors } from "@/src/shared/theme/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
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
  const { userId, provider } = useLocalSearchParams<{
    userId: string;
    provider: string;
  }>();
  const setSignupFields = useSignupStore((state) => state.setSignupFields);

  const sendEmailMutation = useSend();
  const verifyEmailMutation = useVerify();

  const [userType, setUserType] = useState<UserType>(null);
  const [gender, setGender] = useState<Gender>("male");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");

  // 학생 전용
  const [nickname, setNickname] = useState("");

  // 점주 전용
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(295);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sendCodeMessage, setSendCodeMessage] = useState("");
  const sendCodeMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isStudent = userType === "student";
  const primaryColor = userType === "owner" ? Owner.primary : Brand.primary;

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

  const isFormValid = () => {
    if (!userType) return false;

    const commonValid =
      birthYear.length === 4 &&
      birthMonth.length >= 1 &&
      birthDay.length >= 1;

    if (isStudent) {
      return commonValid && nickname.length >= 2 && nickname.length <= 10;
    } else {
      return commonValid && isEmailVerified;
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
    if (!isFormValid() || !userType) return;

    setSignupFields({
      userType,
      gender,
      birthYear,
      birthMonth,
      birthDay,
      nickname,
      ownerEmail: email,
      socialUserId: userId ?? "",
      socialProvider: provider ?? "",
    });

    if (userType === "owner") {
      router.push("/auth/sign-up-owner");
    } else {
      router.push("/auth/sign-up-verify");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
      </View>

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
                  />
                </View>
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
});
