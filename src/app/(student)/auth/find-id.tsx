import { useSendCodeForFindId, useVerifyCodeForFindId } from "@/src/api/auth";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SigninEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyFailCount, setVerifyFailCount] = useState(0);
  const [sendCodeMessage, setSendCodeMessage] = useState("");
  const [isSendCodeError, setIsSendCodeError] = useState(false);
  const sendCodeMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendCodeMutation = useSendCodeForFindId();
  const verifyCodeMutation = useVerifyCodeForFindId();

  // 타이머 로직 - 실제 만료 시간 기반으로 계산
  useEffect(() => {
    if (!showVerification || !expiryTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [showVerification, expiryTime]);

  // AppState 변경 감지 - 앱이 다시 활성화될 때 타이머 재계산
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && expiryTime && showVerification) {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
        setTimeLeft(remaining);
      }
    });
    return () => subscription.remove();
  }, [expiryTime, showVerification]);

  // 재발송 쿨다운 타이머 (60초)
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (sendCodeMessageTimerRef.current) {
        clearTimeout(sendCodeMessageTimerRef.current);
      }
    };
  }, []);

  const showMessage = useCallback((message: string, isError = false) => {
    if (sendCodeMessageTimerRef.current) {
      clearTimeout(sendCodeMessageTimerRef.current);
    }
    setSendCodeMessage(message);
    setIsSendCodeError(isError);
    sendCodeMessageTimerRef.current = setTimeout(() => {
      setSendCodeMessage("");
    }, 30000);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGetVerificationCode = async () => {
    if (!email) return;

    // 쿨다운 중 재발송 시도
    if (resendCooldown > 0) {
      showMessage("1분 후 재발송 가능합니다", true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("이메일 형식이 아닙니다");
      return;
    }

    setEmailError("");
    try {
      await sendCodeMutation.mutateAsync({ data: { email } });
      const now = Date.now();
      const expiry = now + 300000;
      setShowVerification(true);
      setExpiryTime(expiry);
      setTimeLeft(300);
      setVerificationCode("");
      setVerifyFailCount(0);
      setResendCooldown(60);
      setVerifyError("");
      showMessage("인증번호가 발송되었습니다.");
    } catch (error: any) {
      const serverMessage = error?.data?.data?.message ?? error?.data?.message ?? error?.message;
      setEmailError(serverMessage || "가입되지 않은 이메일입니다");
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;

    if (timeLeft <= 0) {
      setVerifyError("인증 시간이 만료되었습니다. 재발송해주세요.");
      return;
    }

    // 5회 초과 체크
    if (verifyFailCount >= 5) {
      setVerifyError("입력 횟수를 초과했습니다. 재발송해주세요.");
      return;
    }

    setVerifyError("");
    try {
      const result = await verifyCodeMutation.mutateAsync({ data: { email, code: verificationCode } });
      // API가 200 OK로 false를 반환하는 경우 처리
      const responseData = (result as any)?.data?.data ?? (result as any)?.data;
      if (responseData === false) {
        const newCount = verifyFailCount + 1;
        setVerifyFailCount(newCount);
        if (newCount >= 5) {
          setVerifyError("입력 횟수를 초과했습니다. 재발송해주세요.");
        } else {
          setVerifyError("인증번호가 일치하지 않습니다");
        }
        return;
      }
      // 아이디 확인 화면으로 이동 (responseData가 아이디 문자열)
      const foundUsername = typeof responseData === "string" ? responseData : String(responseData ?? "");
      router.replace({ pathname: "/auth/find-id-result", params: { username: foundUsername } });
    } catch (error: any) {
      const newCount = verifyFailCount + 1;
      setVerifyFailCount(newCount);
      const serverMessage = error?.data?.data?.message ?? error?.data?.message ?? error?.message;
      if (newCount >= 5) {
        setVerifyError("입력 횟수를 초과했습니다. 재발송해주세요.");
      } else {
        setVerifyError(serverMessage || "인증번호가 일치하지 않습니다");
      }
    }
  };

  const handleFindPassword = () => {
    router.replace("/auth/find-password");
  };

  const isSendButtonDisabled = !email || sendCodeMutation.isPending;
  const sendButtonLabel = sendCodeMutation.isPending
    ? "발송 중..."
    : resendCooldown > 0
    ? `재발송 (${resendCooldown}초)`
    : showVerification
    ? "재발송"
    : "인증번호 받기";
  const sendButtonColor = !isSendButtonDisabled ? "#40ce2b" : "#d5d5d5";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.canGoBack() ? router.back() : router.replace("/auth")} />
      </View>

      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>아이디를 잊어버리셨나요?{"\n"}가입시 등록한 이메일을 입력해주세요</Text>
          <Text style={styles.subtitleText}>아이디를 다시 설정할 수 있게 메일을 보내드릴게요</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity>
            <Text style={[styles.tabText, styles.tabActive]}>아이디찾기</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity onPress={handleFindPassword}>
            <Text style={styles.tabText}>비밀번호 찾기</Text>
          </TouchableOpacity>
        </View>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="example@looky.com"
              placeholderTextColor="#828282"
              value={email}
              onChangeText={(v) => { setEmail(v); setEmailError(""); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: sendButtonColor }]}
              onPress={handleGetVerificationCode}
              disabled={isSendButtonDisabled}
            >
              <Text style={styles.smallButtonText}>{sendButtonLabel}</Text>
            </TouchableOpacity>
          </View>
          {emailError ? (
            <Text style={styles.errorText}> {emailError}</Text>
          ) : (
            <Text style={[styles.hintText, isSendCodeError && styles.errorText]}>
              {sendCodeMessage || " ID 찾기를 위한 대학 이메일을 입력해주세요"}
            </Text>
          )}
        </View>

        {/* Verification Code Input */}
        {showVerification && (
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="인증번호 6자리"
                placeholderTextColor="#828282"
                value={verificationCode}
                onChangeText={(v) => { setVerificationCode(v); setVerifyError(""); }}
                maxLength={6}
                keyboardType="numeric"
                editable={timeLeft > 0 && verifyFailCount < 5}
              />
              <TouchableOpacity
                style={[
                  styles.smallButton,
                  { backgroundColor: verificationCode && timeLeft > 0 && verifyFailCount < 5 && !verifyCodeMutation.isPending ? "#40ce2b" : "#d5d5d5" }
                ]}
                onPress={handleVerifyCode}
                disabled={!verificationCode || timeLeft <= 0 || verifyFailCount >= 5 || verifyCodeMutation.isPending}
              >
                <Text style={[styles.smallButtonText, { textAlign: "center" }]}>
                  확인
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.verificationRow}>
              <Text style={styles.errorText}>
                {verifyError
                  ? ` ${verifyError}`
                  : timeLeft <= 0
                  ? " 인증 시간이 만료되었습니다"
                  : " 인증번호 6자리를 입력해주세요"}
              </Text>
              <Text style={[styles.timerText, timeLeft <= 0 && { color: "#ff6200" }]}>
                {formatTime(timeLeft)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={styles.mainButton}
        onPress={showVerification ? handleVerifyCode : handleGetVerificationCode}
        disabled={showVerification ? !verificationCode || sendCodeMutation.isPending : !email || sendCodeMutation.isPending}
      >
        <Text style={styles.mainButtonText}>다음으로</Text>
      </TouchableOpacity>
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
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  titleContainer: {
    width: "100%",
    gap: 8,
    marginTop: 60,
    marginBottom: 32,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#272828",
    lineHeight: 28,
    fontFamily: "Pretendard",
  },
  subtitleText: {
    fontSize: 13,
    color: "#828282",
    fontFamily: "Pretendard",
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#272828",
  },
  tabActive: {
    color: "#40ce2b",
  },
  divider: {
    width: 1,
    height: 25,
    backgroundColor: "#e6e6e6",
    marginHorizontal: 20,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 20,
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
    marginBottom: 8,
    gap: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#272828",
    fontFamily: "Pretendard",
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    height: 22,
    justifyContent: "center",
  },
  smallButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "Pretendard",
  },
  hintText: {
    fontSize: 10,
    color: "#828282",
    fontFamily: "Pretendard",
  },
  errorText: {
    fontSize: 10,
    color: "#ff6200",
    fontFamily: "Pretendard",
  },
  verificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#40ce2b",
    fontFamily: "Pretendard",
  },
  mainButton: {
    backgroundColor: "#40ce2b",
    marginHorizontal: 24,
    marginBottom: 40,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  mainButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "Pretendard",
  },
});
