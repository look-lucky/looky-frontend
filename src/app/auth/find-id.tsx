import NearDealLogo from "@/assets/images/logo/neardeal-logo.svg";
import { ArrowLeft } from "@/src/components/button/arrow-left";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    if (!showVerification || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showVerification, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGetVerificationCode = () => {
    if (email) {
      setShowVerification(true);
      setTimeLeft(295);
    }
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
              />
              <TouchableOpacity
                style={[styles.smallButton, { backgroundColor: "#40ce2b" }]}
              >
                <Text style={[styles.smallButtonText, { textAlign: "center" }]}>
                  확인
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.verificationRow}>
              <Text style={styles.errorText}>
                {" "}
                인증번호 6자리를 입력해주세요
              </Text>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
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
