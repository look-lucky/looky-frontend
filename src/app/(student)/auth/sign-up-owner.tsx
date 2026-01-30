import { AppButton } from "@/src/shared/common/app-button";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useSignupStore } from "@/src/shared/stores/signup-store";
import { rs } from "@/src/shared/theme/scale";
import { Gray, Owner, Text as TextColors } from "@/src/shared/theme/theme";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";

// 사업자등록증 업로드 아이콘
function DocumentIcon() {
  return (
    <Svg width={rs(36)} height={rs(36)} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke={Gray.gray5}
        strokeWidth="1.5"
      />
      <Path
        d="M12 8v8M8 12h8"
        stroke={Gray.gray5}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// 날짜 포맷 (YYYY-MM-DD)
function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function SignupOwnerPage() {
  console.log("=== SignupOwnerPage mounted ===");
  const router = useRouter();
  const { setSignupFields } = useSignupStore();

  // 폼 상태
  const [storeName, setStoreName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [openDate, setOpenDate] = useState<Date | null>(null);
  const [businessImageUri, setBusinessImageUri] = useState<string | null>(null);

  // 날짜 모달 상태
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // 폼 유효성
  const isFormValid =
    storeName.length > 0 &&
    storePhone.length > 0 &&
    representativeName.length > 0 &&
    businessNumber.length > 0 &&
    openDate !== null;

  // 날짜 선택 확인
  const handleDateConfirm = (date: Date) => {
    setOpenDate(date);
    setDatePickerVisible(false);
  };

  // 이미지 선택
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setBusinessImageUri(result.assets[0].uri);
    }
  };

  // 회원가입 처리
  const handleSignup = () => {
    if (!isFormValid) return;

    setSignupFields({
      storeName,
      storePhone,
      representativeName,
      businessNumber,
      openDate: openDate ? formatDate(openDate) : "",
      businessImageUri: businessImageUri ?? "",
    });

    // TODO: 점주 회원가입 API 호출
    // router.push("/auth/sign-up-done");
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
          안녕하세요 사장님 !
        </ThemedText>
        <ThemedText style={styles.description}>
          사업자 관련 정보들을 입력해주세요
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 가게 이름 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="가게 이름"
            placeholderTextColor={TextColors.placeholder}
            value={storeName}
            onChangeText={setStoreName}
          />
        </View>

        {/* 가게 전화번호 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="가게 전화번호"
            placeholderTextColor={TextColors.placeholder}
            value={storePhone}
            onChangeText={setStorePhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* 대표자명 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="대표자명"
            placeholderTextColor={TextColors.placeholder}
            value={representativeName}
            onChangeText={setRepresentativeName}
          />
        </View>

        {/* 사업자등록번호 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="사업자등록번호"
            placeholderTextColor={TextColors.placeholder}
            value={businessNumber}
            onChangeText={setBusinessNumber}
            keyboardType="number-pad"
          />
        </View>

        {/* 개업일자 */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={[styles.inputContainer, styles.dateFlex]}
            onPress={() => setDatePickerVisible(true)}
          >
            <ThemedText
              style={openDate ? styles.dateText : styles.datePlaceholder}
            >
              {openDate ? formatDate(openDate) : "개업일자"}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: openDate ? Owner.primary : Gray.gray5 },
            ]}
            onPress={() => setDatePickerVisible(true)}
          >
            <ThemedText style={styles.confirmButtonText}>확인</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 사업자 등록증 첨부 */}
        <View style={styles.uploadSection}>
          <ThemedText type="defaultSemiBold" style={styles.uploadLabel}>
            사업자 등록증 첨부
          </ThemedText>
          <TouchableOpacity
            style={styles.uploadArea}
            onPress={handlePickImage}
          >
            {businessImageUri ? (
              <Image
                source={{ uri: businessImageUri }}
                style={styles.uploadedImage}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <DocumentIcon />
                <ThemedText style={styles.uploadText}>
                  사업자등록증
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomContent}>
        <AppButton
          label="회원가입"
          backgroundColor={isFormValid ? Owner.primary : Gray.gray5}
          onPress={handleSignup}
          disabled={!isFormValid}
        />
      </View>

      {/* 날짜 선택 모달 */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
        locale="ko"
      />
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
  titleSection: {
    gap: rs(4),
    marginBottom: rs(24),
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
    gap: rs(12),
    paddingBottom: rs(20),
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
    fontFamily: "Pretendard",
  },
  dateRow: {
    flexDirection: "row",
    gap: rs(8),
  },
  dateFlex: {
    flex: 1,
  },
  dateText: {
    fontSize: rs(14),
    color: TextColors.primary,
  },
  datePlaceholder: {
    fontSize: rs(14),
    color: TextColors.placeholder,
  },
  confirmButton: {
    paddingHorizontal: rs(16),
    borderRadius: rs(8),
    height: rs(44),
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: rs(14),
    fontWeight: "700",
    color: Gray.white,
  },
  uploadSection: {
    gap: rs(8),
    marginTop: rs(8),
  },
  uploadLabel: {
    fontSize: rs(14),
    color: TextColors.primary,
  },
  uploadArea: {
    borderWidth: 1,
    borderColor: Gray.gray4,
    borderStyle: "dashed",
    borderRadius: rs(8),
    height: rs(120),
    justifyContent: "center",
    alignItems: "center",
  },
  uploadPlaceholder: {
    alignItems: "center",
    gap: rs(8),
  },
  uploadText: {
    fontSize: rs(12),
    color: Gray.gray5,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: rs(8),
    resizeMode: "cover",
  },
  bottomContent: {
    paddingTop: rs(16),
  },
});
