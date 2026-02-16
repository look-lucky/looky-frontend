import LookyLogo from "@/assets/images/logo/looky-logo.svg";
import { useSendCodeForFindPassword, useVerifyCodeForFindPassword } from "@/src/api/auth";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  AppState,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FindPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  const sendCodeMutation = useSendCodeForFindPassword();
  const verifyCodeMutation = useVerifyCodeForFindPassword();

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGetVerificationCode = async () => {
    if (!username || !email) return;
    setEmailError("");
    try {
      await sendCodeMutation.mutateAsync({ data: { username, email } });
      const now = Date.now();
      const expiry = now + 300000;
      setShowVerification(true);
      setExpiryTime(expiry);
      setTimeLeft(300);
      setVerificationCode("");
    } catch {
      setShowVerification(false);
      setEmailError("가입되지 않은 이메일입니다");
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    if (timeLeft <= 0) {
      alert("인증 시간이 만료되었습니다. 인증번호를 다시 요청해주세요.");
      return;
    }
    try {
      await verifyCodeMutation.mutateAsync({ data: { email, code: verificationCode } });
      // TODO: 새 비밀번호 설정 화면으로 이동
    } catch {
      alert("인증번호가 올바르지 않습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.canGoBack() ? router.back() : router.replace("/auth")} />
      </View>

      <View style={styles.content}>
        <LookyLogo width={169} height={57} />

        <View style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => router.replace("/auth/find-id")}>
            <Text style={styles.tabText}>아이디찾기</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity>
            <Text style={[styles.tabText, styles.tabActive]}>비밀번호 찾기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="아이디를 입력해주세요"
              placeholderTextColor="#828282"
              value={username}
              onChangeText={(v) => { setUsername(v); setEmailError(""); }}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="가입하신 이메일을 입력해주세요"
              placeholderTextColor="#828282"
              value={email}
              onChangeText={(v) => { setEmail(v); setEmailError(""); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[
                styles.smallButton,
                { backgroundColor: username && email && !sendCodeMutation.isPending ? "#40ce2b" : "#d5d5d5" },
              ]}
              onPress={handleGetVerificationCode}
              disabled={!username || !email || sendCodeMutation.isPending}
            >
              <Text style={styles.smallButtonText}>
                {sendCodeMutation.isPending ? "발송 중..." : "인증번호 받기"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.errorText}>
            {emailError ? ` ${emailError}` : " 비밀번호 찾기를 위한 가입 이메일을 입력해주세요"}
          </Text>
        </View>

        {showVerification && (
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="인증번호 6자리"
                placeholderTextColor="#828282"
                value={verificationCode}
                onChangeText={setVerificationCode}
                maxLength={6}
                keyboardType="numeric"
                editable={timeLeft > 0}
              />
              <TouchableOpacity
                style={[
                  styles.smallButton,
                  { backgroundColor: verificationCode && timeLeft > 0 ? "#40ce2b" : "#d5d5d5" },
                ]}
                onPress={handleVerifyCode}
                disabled={!verificationCode || timeLeft <= 0}
              >
                <Text style={[styles.smallButtonText, { textAlign: "center" }]}>
                  확인
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.verificationRow}>
              <Text style={styles.errorText}>
                {timeLeft <= 0 ? " 인증 시간이 만료되었습니다" : " 인증번호 6자리를 입력해주세요"}
              </Text>
              <Text style={[styles.timerText, timeLeft <= 0 && { color: "#ff6200" }]}>
                {formatTime(timeLeft)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: username && email ? "#40ce2b" : "#d5d5d5" }]}
        disabled={!username || !email}
      >
        <Text style={styles.mainButtonText}>비밀번호 찾기</Text>
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
