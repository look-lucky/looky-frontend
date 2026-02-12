import { useSend, useVerify } from "@/src/api/auth";
import { getGetStudentInfoQueryKey, useUpdateUniversity } from "@/src/api/my-page";
import { useGetUniversities } from "@/src/api/university";
import { AppButton } from "@/src/shared/common/app-button";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { SelectModal, SelectOption } from "@/src/shared/common/select-modal";
import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Fonts, Gray, System, Text as TextColors } from "@/src/shared/theme/theme";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

function ChevronDownIcon({ color = Gray.gray6 }: { color?: string }) {
  return (
    <Svg width={rs(20)} height={rs(20)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ChangeUniversityScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mutations
  const sendEmailMutation = useSend();
  const verifyEmailMutation = useVerify();
  const updateUniversityMutation = useUpdateUniversity();

  // 대학 선택 상태
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);
  const [universityModalVisible, setUniversityModalVisible] = useState(false);

  // 이메일 인증 상태
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(295);
  const [expiryTime, setExpiryTime] = useState<number | null>(null); // 만료 시간 (timestamp)
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 대학 목록
  const { data: universitiesData } = useGetUniversities();
  const universities = Array.isArray((universitiesData as any)?.data?.data)
    ? (universitiesData as any).data.data
    : [];
  const universityOptions: SelectOption[] = universities.map((u: any) => ({
    id: u.id ?? 0,
    label: u.name ?? "",
  }));
  const selectedUniversityName =
    universities.find((u: any) => u.id === selectedUniversityId)?.name ?? "";

  // 타이머 로직 - 실제 만료 시간 기반으로 계산
  useEffect(() => {
    if (!isCodeSent || !expiryTime || isEmailVerified) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimer(remaining);
    };

    // 즉시 한 번 업데이트
    updateTimer();

    // 매초 업데이트
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

    return () => {
      subscription.remove();
    };
  }, [expiryTime, isEmailVerified]);

  // 재발송 쿨다운
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // 메시지 자동 제거
  const showMessage = useCallback((msg: string) => {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    setMessage(msg);
    messageTimerRef.current = setTimeout(() => setMessage(""), 30000);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 대학 변경 시 인증 초기화
  const handleUniversitySelect = (id: string | number) => {
    setSelectedUniversityId(id as number);
    setEmail("");
    setVerificationCode("");
    setIsCodeSent(false);
    setExpiryTime(null);
    setIsEmailVerified(false);
    setMessage("");
  };

  // 인증번호 발송
  const handleSendCode = async () => {
    if (!email || !selectedUniversityId) return;

    try {
      await sendEmailMutation.mutateAsync({
        data: { email, universityId: selectedUniversityId },
      });
      const now = Date.now();
      const expiry = now + 300000; // 5분 (300초 = 300,000ms)
      setIsCodeSent(true);
      setExpiryTime(expiry);
      setTimer(300);
      setResendCooldown(5);
      setVerificationCode(""); // 재발송 시 인증번호 초기화
      showMessage("인증번호가 발송되었습니다.");
    } catch (error: any) {
      console.error("이메일 발송 실패:", error);
      showMessage(error?.message || "대학 이메일을 입력해주세요.");
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!verificationCode) return;

    // 타이머 만료 체크
    if (timer <= 0) {
      showMessage("인증 시간이 만료되었습니다. 인증번호를 다시 요청해주세요.");
      return;
    }

    try {
      await verifyEmailMutation.mutateAsync({
        data: { email, code: verificationCode },
      });
      setIsEmailVerified(true);
      showMessage("이메일 인증이 완료되었습니다.");
    } catch (error: any) {
      console.error("이메일 인증 실패:", error);
      showMessage("인증번호가 일치하지 않습니다.");
    }
  };

  // 대학 변경
  const handleChangeUniversity = () => {
    if (!selectedUniversityId || !isEmailVerified) return;

    updateUniversityMutation.mutate(
      { data: { universityId: selectedUniversityId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetStudentInfoQueryKey() });
          Alert.alert("완료", "대학교가 변경되었습니다.", [
            { text: "확인", onPress: () => router.back() },
          ]);
        },
        onError: (error) => {
          console.error("대학 변경 실패:", error);
          Alert.alert("오류", "대학 변경에 실패했습니다. 다시 시도해주세요.");
        },
      }
    );
  };

  const isFormValid = selectedUniversityId != null && isEmailVerified;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
        <ThemedText style={styles.headerTitle}>대학교 변경하기</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* 대학 선택 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>대학 선택</ThemedText>
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => setUniversityModalVisible(true)}
          >
            <ThemedText
              style={[
                styles.selectFieldText,
                !selectedUniversityId && styles.selectFieldPlaceholder,
              ]}
            >
              {selectedUniversityName || "대학을 선택해주세요"}
            </ThemedText>
            <ChevronDownIcon />
          </TouchableOpacity>
        </View>

        {/* 대학 이메일 인증 */}
        {selectedUniversityId && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>대학 이메일 인증</ThemedText>

            {/* 이메일 입력 */}
            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, styles.inputFlex]}>
                <TextInput
                  style={styles.input}
                  placeholder="학생인증을 위한 메일을 입력해주세요"
                  placeholderTextColor={TextColors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isEmailVerified}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.smallButton,
                  {
                    backgroundColor:
                      email && !isEmailVerified && resendCooldown <= 0 && !sendEmailMutation.isPending
                        ? Brand.primary
                        : Gray.gray5,
                  },
                ]}
                onPress={handleSendCode}
                disabled={!email || isEmailVerified || resendCooldown > 0 || sendEmailMutation.isPending}
              >
                <ThemedText style={styles.smallButtonText}>
                  {sendEmailMutation.isPending
                    ? "발송 중..."
                    : resendCooldown > 0
                      ? `재발송 (${resendCooldown}초)`
                      : isCodeSent
                        ? "인증번호 재발송"
                        : "인증번호 발송"}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* 메시지 */}
            {message !== "" && (
              <ThemedText style={styles.inlineMessage}>{message}</ThemedText>
            )}

            {/* 인증번호 입력 */}
            {isCodeSent && !isEmailVerified && (
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.inputFlex]}>
                  <TextInput
                    style={styles.input}
                    placeholder="인증번호"
                    placeholderTextColor={TextColors.placeholder}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={timer > 0}
                  />
                  <ThemedText style={[styles.timerText, timer <= 0 && styles.timerExpired]}>{formatTimer(timer)}</ThemedText>
                </View>
                <TouchableOpacity
                  style={[
                    styles.smallButton,
                    { backgroundColor: verificationCode && timer > 0 ? Brand.primary : Gray.gray5 },
                  ]}
                  onPress={handleVerifyCode}
                  disabled={!verificationCode || timer <= 0}
                >
                  <ThemedText style={styles.smallButtonText}>
                    확인
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* 인증 완료 */}
            {isEmailVerified && (
              <ThemedText style={styles.successText}>
                이메일 인증이 완료되었습니다
              </ThemedText>
            )}
          </View>
        )}
      </View>

      {/* 변경 버튼 */}
      <View style={styles.bottomContent}>
        <AppButton
          label="변경하기"
          backgroundColor={isFormValid ? Brand.primary : Gray.gray5}
          onPress={handleChangeUniversity}
          disabled={!isFormValid || updateUniversityMutation.isPending}
        />
      </View>

      {/* 대학 선택 모달 */}
      <SelectModal
        visible={universityModalVisible}
        options={universityOptions}
        selectedId={selectedUniversityId ?? 0}
        onSelect={handleUniversitySelect}
        onClose={() => setUniversityModalVisible(false)}
        title="대학교"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(20),
    paddingVertical: rs(12),
    gap: rs(12),
  },
  headerTitle: {
    flex: 1,
    fontSize: rs(18),
    fontWeight: "700",
    fontFamily: Fonts.bold,
    color: TextColors.primary,
  },
  headerRight: {
    width: rs(24),
  },
  content: {
    flex: 1,
    paddingHorizontal: rs(24),
    gap: rs(24),
  },
  section: {
    gap: rs(8),
  },
  sectionLabel: {
    fontSize: rs(14),
    fontWeight: "600",
    fontFamily: Fonts.semiBold,
    color: TextColors.primary,
  },
  selectField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Gray.gray4,
    borderRadius: rs(8),
    paddingHorizontal: rs(16),
    height: rs(48),
  },
  selectFieldText: {
    fontSize: rs(14),
    color: TextColors.primary,
    fontFamily: "Pretendard",
  },
  selectFieldPlaceholder: {
    color: TextColors.placeholder,
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
    height: rs(44),
  },
  inputFlex: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: rs(14),
    color: TextColors.primary,
    fontFamily: "Pretendard",
  },
  smallButton: {
    flexShrink: 0,
    paddingHorizontal: rs(12),
    borderRadius: rs(8),
    height: rs(44),
    justifyContent: "center",
    alignItems: "center",
  },
  smallButtonText: {
    fontSize: rs(12),
    fontWeight: "700",
    color: Gray.white,
    fontFamily: Fonts.bold,
  },
  timerText: {
    fontSize: rs(14),
    color: Brand.primary,
    fontWeight: "600",
    fontFamily: Fonts.semiBold,
  },
  timerExpired: {
    color: System.error,
  },
  inlineMessage: {
    fontSize: rs(12),
    color: TextColors.secondary,
    paddingLeft: rs(4),
    fontFamily: Fonts.regular,
  },
  successText: {
    fontSize: rs(12),
    color: Brand.primary,
    fontWeight: "600",
    fontFamily: Fonts.semiBold,
  },
  bottomContent: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(40),
    paddingTop: rs(16),
  },
});
