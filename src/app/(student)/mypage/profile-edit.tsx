import { getGetStudentInfoQueryKey, useGetStudentInfo, useUpdateStudentProfile } from "@/src/api/my-page";
import { OrganizationResponseCategory } from "@/src/api/generated.schemas";
import { useGetDepartmentsByCollege, useGetOrganizations } from "@/src/api/organization";
import { AppButton } from "@/src/shared/common/app-button";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { SelectModal, SelectOption } from "@/src/shared/common/select-modal";
import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Fonts, Gray, Text as TextColors } from "@/src/shared/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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

function ChevronRightIcon({ color = Gray.gray6 }: { color?: string }) {
  return (
    <Svg width={rs(20)} height={rs(20)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6l6 6-6 6"
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

export default function ProfileEditScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 현재 프로필 정보 로드
  const { data: studentInfoRes } = useGetStudentInfo();
  const studentInfo = (studentInfoRes as any)?.data?.data;

  // 프로필 수정 mutation
  const updateProfileMutation = useUpdateStudentProfile();

  // 폼 상태
  const [nickname, setNickname] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [isClubMember, setIsClubMember] = useState<boolean | null>(null);

  // 모달 상태
  const [collegeModalVisible, setCollegeModalVisible] = useState(false);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);

  // 대학 정보 (읽기 전용)
  const universityId = studentInfo?.universityId as number | undefined;
  const universityName = studentInfo?.universityName ?? "";

  // 초기 데이터 로드
  useEffect(() => {
    if (studentInfo) {
      setNickname(studentInfo.username ?? "");
      setSelectedCollegeId(studentInfo.collegeId ?? null);
      setSelectedDepartmentId(studentInfo.departmentId ?? null);
      setIsClubMember(studentInfo.isClubMember ?? null);
    }
  }, [studentInfo]);

  // 화면 focus 시 데이터 새로고침 (대학교 변경 후 돌아올 때)
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: getGetStudentInfoQueryKey() });
    }, [queryClient])
  );

  // 단과대학 목록
  const { data: organizationsData } = useGetOrganizations(universityId!, {
    query: { enabled: universityId != null },
  });
  const rawOrganizations = (organizationsData as any)?.data?.data;
  const organizations = Array.isArray(rawOrganizations) ? rawOrganizations : [];
  const colleges = useMemo(
    () => organizations.filter((org: any) => org.category === OrganizationResponseCategory.COLLEGE),
    [organizations]
  );

  // 학과 목록
  const { data: departmentsData } = useGetDepartmentsByCollege(selectedCollegeId!, {
    query: { enabled: selectedCollegeId != null },
  });
  const rawDepartments = (departmentsData as any)?.data?.data;
  const departments = Array.isArray(rawDepartments) ? rawDepartments : [];

  // SelectModal 옵션
  const collegeOptions: SelectOption[] = colleges.map((c: any) => ({
    id: c.id ?? 0,
    label: c.name ?? "",
  }));
  const departmentOptions: SelectOption[] = departments.map((d: any) => ({
    id: d.id ?? 0,
    label: d.name ?? "",
  }));

  // 선택된 이름
  const selectedCollegeName = colleges.find((c: any) => c.id === selectedCollegeId)?.name ?? "";
  const selectedDepartmentName = departments.find((d: any) => d.id === selectedDepartmentId)?.name ?? "";

  // 저장
  const handleSave = () => {
    if (!selectedCollegeId || !selectedDepartmentId || isClubMember === null) {
      Alert.alert("알림", "모든 항목을 입력해주세요.");
      return;
    }

    updateProfileMutation.mutate(
      {
        data: {
          nickname: nickname || undefined,
          collegeId: selectedCollegeId,
          departmentId: selectedDepartmentId,
          isClubMember,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetStudentInfoQueryKey() });
          Alert.alert("완료", "프로필이 수정되었습니다.", [
            { text: "확인", onPress: () => router.back() },
          ]);
        },
        onError: (error) => {
          console.error("프로필 수정 실패:", error);
          Alert.alert("오류", "프로필 수정에 실패했습니다. 다시 시도해주세요.");
        },
      }
    );
  };

  const isFormValid =
    nickname.trim() !== "" &&
    selectedCollegeId != null &&
    selectedDepartmentId != null &&
    isClubMember !== null;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
        <ThemedText style={styles.headerTitle}>프로필 수정</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 아이콘 */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={rs(48)} color={Gray.gray5} />
          </View>
        </View>

        {/* 닉네임 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>닉네임</ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임을 입력해주세요"
              placeholderTextColor={TextColors.placeholder}
            />
          </View>
        </View>

        {/* 대학교 (읽기 전용, 변경 시 별도 화면) */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <ThemedText style={styles.sectionLabel}>대학교</ThemedText>
            <ThemedText style={styles.labelHint}>
              소속 대학 변경을 위해 학교 재인증이 필요합니다.
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => router.push("/mypage/change-university")}
          >
            <ThemedText style={styles.selectFieldText}>
              {universityName || "대학교 정보 없음"}
            </ThemedText>
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        {/* 단과대학 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>단과대학</ThemedText>
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

        {/* 소속학과 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>소속학과</ThemedText>
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

        {/* 동아리 가입 여부 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>동아리 가입 여부</ThemedText>
          <View style={styles.radioGroup}>
            <RadioButton
              selected={isClubMember === true}
              label="예"
              onPress={() => setIsClubMember(true)}
            />
            <RadioButton
              selected={isClubMember === false}
              label="아니오"
              onPress={() => setIsClubMember(false)}
            />
          </View>
        </View>
      </ScrollView>

      {/* 저장 버튼 */}
      <View style={styles.bottomContent}>
        <AppButton
          label="저장하기"
          backgroundColor={isFormValid ? Brand.primary : Gray.gray5}
          onPress={handleSave}
          disabled={!isFormValid || updateProfileMutation.isPending}
        />
      </View>

      {/* 단과대학 선택 모달 */}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(40),
    gap: rs(24),
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: rs(16),
  },
  avatarCircle: {
    width: rs(96),
    height: rs(96),
    borderRadius: rs(48),
    backgroundColor: Gray.gray2,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    gap: rs(8),
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  sectionLabel: {
    fontSize: rs(14),
    fontWeight: "600",
    fontFamily: Fonts.semiBold,
    color: TextColors.primary,
  },
  labelHint: {
    fontSize: rs(10),
    fontFamily: Fonts.regular,
    color: TextColors.tertiary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Gray.gray4,
    borderRadius: rs(8),
    paddingHorizontal: rs(16),
    height: rs(48),
  },
  input: {
    flex: 1,
    fontSize: rs(14),
    color: TextColors.primary,
    fontFamily: "Pretendard",
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
    color: TextColors.primary,
    fontFamily: "Pretendard",
  },
  bottomContent: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(40),
    paddingTop: rs(16),
  },
});
