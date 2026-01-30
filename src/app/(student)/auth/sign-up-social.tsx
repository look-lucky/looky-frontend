import { useCompleteSocialSignup } from "@/src/api/auth";
import { OrganizationResponseCategory } from "@/src/api/generated.schemas";
import { useGetOrganizations } from "@/src/api/organization";
import { AppButton } from "@/src/shared/common/app-button";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { SelectModal, SelectOption } from "@/src/shared/common/select-modal";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useAuth } from "@/src/shared/lib/auth";
import type { UserType } from "@/src/shared/lib/auth/token";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Gray, Text as TextColors } from "@/src/shared/theme/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

type Gender = "male" | "female";

// JWT payload 디코딩
function decodeJwtPayload(token: string): { role?: string } | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

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

export default function SocialSignupPage() {
  const router = useRouter();
  const { userId, provider } = useLocalSearchParams<{
    userId: string;
    provider: string;
  }>();
  const { handleAuthSuccess } = useAuth();
  const completeSocialSignupMutation = useCompleteSocialSignup();

  // 폼 상태
  const [gender, setGender] = useState<Gender>("male");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [nickname, setNickname] = useState("");

  // 대학/단과대학/학과 선택
  const universityId = 1; // TODO: 대학 선택 구현
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [collegeModalVisible, setCollegeModalVisible] = useState(false);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);

  // 소속 목록 조회
  const { data: organizationsData } = useGetOrganizations(universityId);
  const rawOrganizations = organizationsData?.data?.data;
  const organizations = Array.isArray(rawOrganizations) ? rawOrganizations : [];

  const colleges = useMemo(
    () => organizations.filter((org) => org.category === OrganizationResponseCategory.COLLEGE),
    [organizations]
  );

  const departments = useMemo(
    () => organizations.filter((org) => org.category === OrganizationResponseCategory.DEPARTMENT),
    [organizations]
  );

  const collegeOptions: SelectOption[] = colleges.map((college) => ({
    id: college.id ?? 0,
    label: college.name ?? "",
  }));

  const departmentOptions: SelectOption[] = departments.map((dept) => ({
    id: dept.id ?? 0,
    label: dept.name ?? "",
  }));

  const selectedCollegeName = colleges.find((c) => c.id === selectedCollegeId)?.name ?? "";
  const selectedDepartmentName = departments.find((d) => d.id === selectedDepartmentId)?.name ?? "";

  // 폼 유효성 검사
  const isFormValid =
    birthYear.length === 4 &&
    birthMonth.length >= 1 &&
    birthDay.length >= 1 &&
    nickname.length >= 2 &&
    nickname.length <= 10 &&
    selectedCollegeId !== null &&
    selectedDepartmentId !== null;

  const handleComplete = () => {
    if (!isFormValid || !userId) return;

    const birthDate = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;
    const apiGender = gender === "male" ? "MALE" : "FEMALE";

    completeSocialSignupMutation.mutate(
      {
        params: {
          userId: parseInt(userId, 10),
          role: "ROLE_STUDENT",
          gender: apiGender,
          birthDate,
          nickname,
          universityId,
          collegeId: selectedCollegeId!,
          departmentId: selectedDepartmentId!,
        },
      },
      {
        onSuccess: async (response) => {
          console.log("소셜 회원가입 완료:", response);

          if (response.status === 200 && response.data?.data?.accessToken) {
            const { accessToken, expiresIn } = response.data.data;
            const jwtPayload = decodeJwtPayload(accessToken);
            const role = (jwtPayload?.role as UserType) ?? "ROLE_STUDENT";

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
  };

  const providerName = provider === "google" ? "Google" : provider === "kakao" ? "카카오" : "소셜";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
      </View>

      <View style={styles.titleSection}>
        <ThemedText type="subtitle" style={styles.title}>
          {providerName} 계정으로 가입
        </ThemedText>
        <ThemedText style={styles.description}>
          추가 정보를 입력해주세요.
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 성별 */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            성별
          </ThemedText>
          <View style={styles.radioGroup}>
            <RadioButton
              selected={gender === "male"}
              label="남자"
              onPress={() => setGender("male")}
            />
            <RadioButton
              selected={gender === "female"}
              label="여자"
              onPress={() => setGender("female")}
            />
          </View>
        </View>

        {/* 생년월일 */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
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

        {/* 닉네임 */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            닉네임
          </ThemedText>
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

        {/* 단과대학 선택 */}
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
              {selectedCollegeName || "단과대학을 선택해주세요"}
            </ThemedText>
            <ChevronDownIcon />
          </TouchableOpacity>
        </View>

        {/* 학과 선택 */}
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
              {selectedDepartmentName || "학과를 선택해주세요"}
            </ThemedText>
            <ChevronDownIcon />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomContent}>
        <AppButton
          label={completeSocialSignupMutation.isPending ? "처리 중..." : "가입 완료"}
          backgroundColor={isFormValid ? Brand.primary : Gray.gray5}
          onPress={handleComplete}
          disabled={!isFormValid || completeSocialSignupMutation.isPending}
        />
      </View>

      <SelectModal
        visible={collegeModalVisible}
        options={collegeOptions}
        selectedId={selectedCollegeId ?? 0}
        onSelect={(id) => {
          setSelectedCollegeId(id as number);
          setSelectedDepartmentId(null);
        }}
        onClose={() => setCollegeModalVisible(false)}
        title="단과대학"
      />

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
    gap: rs(20),
    paddingBottom: rs(20),
  },
  section: {
    gap: rs(8),
  },
  sectionTitle: {
    color: TextColors.primary,
    fontSize: rs(14),
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
    height: rs(44),
    borderWidth: 1,
    borderColor: Gray.gray4,
    borderRadius: rs(8),
    paddingHorizontal: rs(12),
    fontSize: rs(14),
    color: TextColors.primary,
    textAlign: "center",
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
  input: {
    flex: 1,
    fontSize: rs(14),
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
    height: rs(44),
  },
  selectFieldText: {
    fontSize: rs(14),
    color: TextColors.primary,
  },
  selectFieldPlaceholder: {
    color: TextColors.placeholder,
  },
  bottomContent: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(40),
    paddingTop: rs(16),
  },
});
