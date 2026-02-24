import LookyLogo from "@/assets/images/logo/looky-logo.svg";
import { useResetPassword } from "@/src/api/auth";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*^#?&])[A-Za-z\d@$!%*^#?&]{8,20}$/;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetToken } = useLocalSearchParams<{ resetToken: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async () => {
    setError("");
    if (!PASSWORD_REGEX.test(newPassword)) {
      setError("영문, 숫자, 특수문자(@$!%*^#?&) 포함 8~20자로 입력해주세요");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({
        data: { resetToken: resetToken ?? "", newPassword },
      });
      router.replace("/auth/sign-in");
    } catch {
      setError("비밀번호 재설정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const isValid =
    newPassword.length >= 8 &&
    confirmPassword.length >= 8 &&
    !resetPasswordMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ArrowLeft
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/auth/find-password")
          }
        />
      </View>

      <View style={styles.content}>
        <LookyLogo width={169} height={57} />

        <View style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => router.replace("/auth/find-id")}>
            <Text style={styles.tabText}>아이디찾기</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => router.replace("/auth/find-password")}
          >
            <Text style={[styles.tabText, styles.tabActive]}>비밀번호 찾기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호를 입력해주세요"
              placeholderTextColor="#828282"
              value={newPassword}
              onChangeText={(v) => {
                setNewPassword(v);
                setError("");
              }}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
          <Text style={styles.hintText}> 영문, 숫자, 특수문자 포함 8~20자</Text>
        </View>

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호를 다시 입력해주세요"
              placeholderTextColor="#828282"
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                setError("");
              }}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
          {error ? (
            <Text style={styles.errorText}> {error}</Text>
          ) : null}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.mainButton,
          { backgroundColor: isValid ? "#40ce2b" : "#d5d5d5" },
        ]}
        onPress={handleSubmit}
        disabled={!isValid}
      >
        <Text style={styles.mainButtonText}>
          {resetPasswordMutation.isPending ? "변경 중..." : "비밀번호 변경"}
        </Text>
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
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#272828",
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
