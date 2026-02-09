import { useCompleteSocialSignup, useLogin, useSend, useSignupStudent, useVerify } from "@/src/api/auth";
import { CommonResponseLoginResponse, OrganizationResponseCategory } from "@/src/api/generated.schemas";
import { useGetOrganizations } from "@/src/api/organization";
import { AppButton } from "@/src/shared/common/app-button";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { SelectModal, SelectOption } from "@/src/shared/common/select-modal";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useAuth } from "@/src/shared/lib/auth";
import type { UserType } from "@/src/shared/lib/auth/token";
import { useSignupStore } from "@/src/shared/stores/signup-store";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Gray, Text as TextColors } from "@/src/shared/theme/theme";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

// 드롭다운 화살표 아이콘
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

export default function StudentVerificationPage() {
  const router = useRouter();

  // Store에서 회원가입 정보 가져오기
  const {
    nickname,
    username,
    password,
    gender,
    birthYear,
    birthMonth,
    birthDay,
    socialUserId,
    setSignupFields,
  } = useSignupStore();

  // Auth
  const { handleAuthSuccess, saveUserCollegeId } = useAuth();

  // Mutations
  const signupMutation = useSignupStudent();
  const loginMutation = useLogin();
  const completeSocialSignupMutation = useCompleteSocialSignup();
  const sendEmailMutation = useSend();
  const verifyEmailMutation = useVerify();

  // TODO: 실제로는 선택된 대학 ID 사용
  const universityId = 1;

  // 이메일 인증 상태
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(295); // 4:55
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 단과대학/학과 선택 상태
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [collegeModalVisible, setCollegeModalVisible] = useState(false);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);

  // 소속 목록 조회 (React Query)
  const { data: organizationsData } = useGetOrganizations(universityId);
  const rawOrganizations = organizationsData?.data?.data;
  const organizations = Array.isArray(rawOrganizations) ? rawOrganizations : [];

  // 단과대학 목록 필터링
  const colleges = useMemo(() =>
    organizations.filter(org => org.category === OrganizationResponseCategory.COLLEGE),
    [organizations]
  );

  // 선택된 단과대학의 학과 목록 필터링
  // TODO: parentId 필드가 API response에 없어서 일단 전체 학과 목록 사용
  const departments = useMemo(() =>
    organizations.filter(org => org.category === OrganizationResponseCategory.DEPARTMENT),
    [organizations]
  );

  // SelectModal용 옵션 변환
  const collegeOptions: SelectOption[] = colleges.map(college => ({
    id: college.id ?? 0,
    label: college.name ?? "",
  }));

  const departmentOptions: SelectOption[] = departments.map(dept => ({
    id: dept.id ?? 0,
    label: dept.name ?? "",
  }));

  // 선택된 단과대학/학과 이름
  const selectedCollegeName = colleges.find(c => c.id === selectedCollegeId)?.name ?? "";
  const selectedDepartmentName = departments.find(d => d.id === selectedDepartmentId)?.name ?? "";

  // 타이머 로직
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isCodeSent && timer > 0 && !isEmailVerified) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCodeSent, timer, isEmailVerified]);

  // 타이머 포맷 (MM:SS)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 인증번호 발송
  const handleSendCode = async () => {
    if (!email) return;

    try {
      await sendEmailMutation.mutateAsync({
        data: { email }
      });
      setIsCodeSent(true);
      setTimer(300);
      Alert.alert("인증번호 발송", "이메일로 인증번호가 발송되었습니다.");
    } catch (error: any) {
      console.error("이메일 발송 실패:", error);
      Alert.alert("발송 실패", error?.message || "인증번호 발송에 실패했습니다.");
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!verificationCode) return;

    try {
      await verifyEmailMutation.mutateAsync({
        data: {
          email,
          code: verificationCode
        }
      });
      setIsEmailVerified(true);
      Alert.alert("인증 성공", "이메일 인증이 완료되었습니다.");
    } catch (error: any) {
      console.error("이메일 인증 실패:", error);
      Alert.alert("인증 실패", error?.message || "인증번호가 일치하지 않습니다.");
    }
  };

  // 폼 유효성 검사
  const isFormValid =
    isEmailVerified &&
    selectedCollegeId !== null &&
    selectedDepartmentId !== null;

  // 완료 처리
  const handleComplete = () => {
    if (!isFormValid || !selectedCollegeId || !selectedDepartmentId) return;

    const birthDate = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;
    const apiGender = gender === "male" ? "MALE" : "FEMALE";

    // 소셜 회원가입 흐름
    if (socialUserId) {
      completeSocialSignupMutation.mutate(
        {
          params: {
            userId: parseInt(socialUserId, 10),
            role: "ROLE_STUDENT",
            gender: apiGender,
            birthDate,
            nickname,
            universityId,
            collegeId: selectedCollegeId,
            departmentId: selectedDepartmentId,
          },
        },
        {
          onSuccess: async (response) => {
            if (response.status === 200 && response.data?.data?.accessToken) {
              const { accessToken, expiresIn } = response.data.data;
              const jwtPayload = (() => {
                try {
                  return JSON.parse(atob(accessToken.split(".")[1]));
                } catch {
                  return null;
                }
              })();
              const role = (jwtPayload?.role as UserType) ?? "ROLE_STUDENT";
              await saveUserCollegeId(selectedCollegeId!);
              await handleAuthSuccess(accessToken, expiresIn ?? 3600, role);
              router.replace("/(student)/(tabs)");
            } else {
              Alert.alert("오류", "회원가입 처리 중 문제가 발생했습니다.");
            }
          },
          onError: (error) => {
            console.error("소셜 회원가입 실패:", error);
            Alert.alert("오류", "회원가입에 실패했습니다. 다시 시도해주세요.");
          },
        }
      );
      return;
    }

    // 일반 회원가입 흐름
    signupMutation.mutate(
      {
        data: {
          username,
          password,
          nickname,
          gender: apiGender,
          birthDate,
          universityId,
          collegeId: selectedCollegeId,
          departmentId: selectedDepartmentId,
        },
      },
      {
        onSuccess: async (response) => {
          console.log("회원가입 성공:", response);

          await saveUserCollegeId(selectedCollegeId!);

          setSignupFields({
            universityId,
            universityName: "전북대학교",
            collegeId: selectedCollegeId,
            collegeName: selectedCollegeName,
            departmentId: selectedDepartmentId,
            departmentName: selectedDepartmentName,
            studentEmail: email,
          });

          loginMutation.mutate(
            { data: { username, password } },
            {
              onSuccess: async (loginResponse) => {
                console.log("로그인 성공:", loginResponse);
                if (loginResponse.status === 200) {
                  const data = loginResponse.data as unknown as CommonResponseLoginResponse;
                  if (data?.data) {
                    await handleAuthSuccess(
                      data.data.accessToken ?? "",
                      data.data.expiresIn ?? 3600,
                      "ROLE_CUSTOMER"
                    );
                  }
                }
                router.push("/auth/sign-up-done");
              },
              onError: (loginError) => {
                console.error("자동 로그인 실패:", loginError);
                router.push("/auth/sign-up-done");
              },
            }
          );
        },
        onError: (error) => {
          console.error("회원가입 실패:", error);
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <ThemedText type="subtitle" style={styles.title}>
          {nickname} 님이시네요!
        </ThemedText>
        <ThemedText style={styles.description}>
          학생 인증을 위한 정보를 기입해주세요.
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 대학 이메일 인증 섹션 */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            대학 이메일 인증
          </ThemedText>

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
                { backgroundColor: email && !isEmailVerified ? Brand.primary : Gray.gray5 },
              ]}
              onPress={handleSendCode}
              disabled={!email || isEmailVerified}
            >
              <ThemedText style={styles.smallButtonText}>
                인증번호 받기
              </ThemedText>
            </TouchableOpacity>
          </View>

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
                />
                <ThemedText style={styles.timerText}>
                  {formatTimer(timer)}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[
                  styles.smallButton,
                  { backgroundColor: verificationCode ? Brand.primary : Gray.gray5 },
                ]}
                onPress={handleVerifyCode}
                disabled={!verificationCode}
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
              <ThemedText style={styles.successText}>
                ✓ 이메일 인증이 완료되었습니다
              </ThemedText>
            </View>
          )}
        </View>

        {/* 단과대학 선택 섹션 */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            단과대학 선택
          </ThemedText>
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => setCollegeModalVisible(true)}
          >
            <ThemedText
              style={[
                styles.selectFieldText,
                !selectedCollegeId && styles.selectFieldPlaceholder,
              ]}
            >
              {selectedCollegeName || "경상대학"}
            </ThemedText>
            <ChevronDownIcon />
          </TouchableOpacity>
        </View>

        {/* 학과 선택 섹션 */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            학과 선택
          </ThemedText>
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => setDepartmentModalVisible(true)}
            disabled={!selectedCollegeId}
          >
            <ThemedText
              style={[
                styles.selectFieldText,
                !selectedDepartmentId && styles.selectFieldPlaceholder,
              ]}
            >
              {selectedDepartmentName || "경영학과"}
            </ThemedText>
            <ChevronDownIcon />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomContent}>
        <AppButton
          label="완료"
          backgroundColor={isFormValid ? Brand.primary : Gray.gray5}
          onPress={handleComplete}
          disabled={!isFormValid}
        />
      </View>

      {/* 단과대학 선택 모달 */}
      <SelectModal
        visible={collegeModalVisible}
        options={collegeOptions}
        selectedId={selectedCollegeId ?? 0}
        onSelect={(id) => {
          setSelectedCollegeId(id as number);
          setSelectedDepartmentId(null); // 단과대학 변경 시 학과 초기화
        }}
        onClose={() => setCollegeModalVisible(false)}
        title="단과대학"
      />

      {/* 학과 선택 모달 */}
      <SelectModal
        visible={departmentModalVisible}
        options={departmentOptions}
        selectedId={selectedDepartmentId ?? 0}
        onSelect={(id) => setSelectedDepartmentId(id as number)}
        onClose={() => setDepartmentModalVisible(false)}
        title="학과"
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
    paddingHorizontal: rs(24),
    paddingVertical: rs(12),
    alignItems: "flex-start",
  },
  titleSection: {
    paddingHorizontal: rs(24),
    paddingTop: rs(8),
    paddingBottom: rs(24),
    gap: rs(4),
  },
  title: {
    color: TextColors.primary,
  },
  description: {
    color: TextColors.secondary,
    fontSize: rs(14),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: rs(24),
    gap: rs(24),
  },
  section: {
    gap: rs(8),
  },
  sectionTitle: {
    color: TextColors.primary,
    fontSize: rs(14),
  },
  inputRow: {
    flexDirection: "row",
    gap: rs(8),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Gray.white,
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
  },
  timerText: {
    fontSize: rs(14),
    color: Brand.primary,
    fontWeight: "600",
  },
  selectField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Gray.white,
    borderWidth: 1,
    borderColor: Gray.gray4,
    borderRadius: rs(8),
    paddingHorizontal: rs(16),
    height: rs(44),
  },
  selectFieldText: {
    fontSize: rs(14),
    color: TextColors.primary,
  },
  selectFieldPlaceholder: {
    color: TextColors.placeholder,
  },
  successMessage: {
    paddingVertical: rs(8),
  },
  successText: {
    fontSize: rs(12),
    color: Brand.primary,
    fontWeight: "600",
  },
  bottomContent: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(40),
    paddingTop: rs(16),
  },
});
