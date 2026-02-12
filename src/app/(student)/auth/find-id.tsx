import NearDealLogo from "@/assets/images/logo/neardeal-logo.svg";
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

export default function SigninEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(295); // 4:55 in seconds
  const [expiryTime, setExpiryTime] = useState<number | null>(null); // 만료 시간 (timestamp)
  const [showVerification, setShowVerification] = useState(false);

  // 타이머 로직 - 실제 만료 시간 기반으로 계산
  useEffect(() => {
    if (!showVerification || !expiryTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(remaining);
    };

    // 즉시 한 번 업데이트
    updateTimer();

    // 매초 업데이트
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

    return () => {
      subscription.remove();
    };
  }, [expiryTime, showVerification]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGetVerificationCode = () => {
    if (email) {
      const now = Date.now();
      const expiry = now + 300000; // 5분 (300초 = 300,000ms)
      setShowVerification(true);
      setExpiryTime(expiry);
      setTimeLeft(300);
      setVerificationCode(""); // 재발송 시 인증번호 초기화
    }
  };

  const handleVerifyCode = () => {
    if (!verificationCode) return;

    // 타이머 만료 체크
    if (timeLeft <= 0) {
      alert("인증 시간이 만료되었습니다. 인증번호를 다시 요청해주세요.");
      return;
    }

    // 여기에 실제 인증 로직 추가
    console.log("인증번호 확인:", verificationCode);
  };

  const handleFindPassword = () => {
    // Navigate to find password page
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
      </View>

      <View style={styles.content}>
        {/* Logo */}
        <NearDealLogo width={169} height={57} />

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
              placeholder="가입하신 ID 이메일을 입력해주세요"
              placeholderTextColor="#828282"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={[
                styles.smallButton,
                { backgroundColor: email ? "#40ce2b" : "#d5d5d5" },
              ]}
              onPress={handleGetVerificationCode}
              disabled={!email}
            >
              <Text style={styles.smallButtonText}>인증번호 받기</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.errorText}>
            {" "}
            ID 찾기를 위한 대학 이메일을 입력해주세요
          </Text>
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
                onChangeText={setVerificationCode}
                maxLength={6}
                keyboardType="numeric"
                editable={timeLeft > 0}
              />
              <TouchableOpacity
                style={[
                  styles.smallButton,
                  { backgroundColor: verificationCode && timeLeft > 0 ? "#40ce2b" : "#d5d5d5" }
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

      {/* Find ID Button */}
      <TouchableOpacity style={styles.mainButton}>
        <Text style={styles.mainButtonText}>아이디 찾기</Text>
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
  logo: {
    width: 169,
    height: 57,
    marginTop: 40,
    marginBottom: 60,
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
