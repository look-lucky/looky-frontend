import { AppButton } from "@/src/shared/common/app-button";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useSignupStore } from "@/src/shared/stores/signup-store";
import { rs } from "@/src/shared/theme/scale";
import { Gray, Owner, Text as TextColors } from "@/src/shared/theme/theme";
import { useSignupOwner, useCompleteSocialSignup, login } from "@/src/api/auth";
import { useAuth } from "@/src/shared/lib/auth";
import { logOwnerSignUpComplete } from "@/src/shared/lib/analytics";
import { saveCredentials, saveToken } from "@/src/shared/lib/auth/token";
import type { UserType } from "@/src/shared/lib/auth/token";
import { useVerifyBizRegNo, useCreateStoreClaims } from "@/src/api/store-claim";
import * as ImagePicker from "expo-image-picker";
import { uploadImageAsset, validateImageAsset } from "@/src/shared/hooks/use-upload-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
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
  const {
    storeId: savedStoreId,
    storeName: savedStoreName,
    storeAddress: savedStoreAddress,
    username,
    password,
    ownerEmail,
    ownerPhone,
    gender,
    birthYear,
    birthMonth,
    birthDay,
    socialUserId,
  } = useSignupStore();

  // Auth
  const { handleAuthSuccess, userType: authUserType } = useAuth();

  // API 훅
  const signupOwnerMutation = useSignupOwner();
  const completeSocialSignupMutation = useCompleteSocialSignup();
  const verifyBizRegNoMutation = useVerifyBizRegNo();
  const createStoreClaimsMutation = useCreateStoreClaims();

  // 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBizVerified, setIsBizVerified] = useState(false);

  // 폼 상태 (zustand에서 복원)
  const [storeName, setStoreName] = useState(savedStoreName);
  const [storePhone, setStorePhone] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [openDate, setOpenDate] = useState<Date | null>(null);
  const [businessImageUri, setBusinessImageUri] = useState<string | null>(null);

  // 날짜 모달 상태
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // 검색 화면에서 돌아왔을 때 zustand → 로컬 state 동기화
  useEffect(() => {
    if (savedStoreName) setStoreName(savedStoreName);
  }, [savedStoreName]);

  // 폼 유효성
  const isFormValid =
    storeName.length > 0 &&
    storePhone.length > 0 &&
    representativeName.length > 0 &&
    businessNumber.length > 0 &&
    isBizVerified &&
    openDate !== null &&
    businessImageUri !== null;

  // 날짜 선택 확인
  const handleDateConfirm = (date: Date) => {
    setOpenDate(date);
    setDatePickerVisible(false);
  };

  // 이미지 선택
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const error = validateImageAsset(asset, 'profile');
      if (error) {
        Alert.alert('알림', error);
        return;
      }
      setBusinessImageUri(asset.uri);
    }
  };

  // 사업자 검증
  const handleVerifyBusiness = async () => {
    const pureBizNum = businessNumber.replace(/-/g, '');

    if (pureBizNum.length !== 10) {
      Alert.alert('알림', '사업자등록번호 10자리를 올바르게 입력해주세요.');
      return;
    }

    if (!representativeName || !openDate) {
      Alert.alert('알림', '대표자명과 개업일자를 먼저 입력해주세요.');
      return;
    }

    setIsVerifying(true);

    try {
      const formattedOpenDate = formatDate(openDate);

      await verifyBizRegNoMutation.mutateAsync({
        data: {
          bizs: [{
            b_no: pureBizNum,
            p_nm: representativeName,
            start_dt: formattedOpenDate.replace(/-/g, ''),
          }]
        }
      });

      setIsBizVerified(true);
      Alert.alert('성공', '사업자 정보가 확인되었습니다.');
    } catch (error) {
      console.error('사업자 인증 실패:', error);
      setIsBizVerified(false);
      Alert.alert('실패', '유효하지 않은 사업자 번호이거나\n등록할 수 없는 번호입니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 회원가입 처리
  const handleSignup = async () => {
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const birthDate = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;
      const apiGender = gender === "male" ? "MALE" : "FEMALE";

      // 소셜 회원가입 흐름
      if (socialUserId) {
        const socialResponse = await completeSocialSignupMutation.mutateAsync({
          params: {
            userId: parseInt(socialUserId, 10),
          },
          data: {
            role: "ROLE_OWNER",
            gender: apiGender as "MALE" | "FEMALE",
            birthDate,
          },
        });

        const socialData = (socialResponse as any)?.data?.data;
        if (!socialData?.accessToken) {
          throw new Error("소셜 회원가입 처리 중 오류가 발생했습니다.");
        }

        const { accessToken, expiresIn } = socialData;
        const jwtPayload = (() => {
          try { return JSON.parse(atob(accessToken.split(".")[1])); } catch { return null; }
        })();
        const role = (jwtPayload?.role as UserType) ?? "ROLE_OWNER";
        const userId = jwtPayload?.sub ? parseInt(jwtPayload.sub, 10) : null;

        if (!userId) {
          throw new Error("사용자 정보를 확인할 수 없습니다.");
        }

        if (!savedStoreId) {
          throw new Error("가게 정보를 찾을 수 없습니다. 가게 검색 후 다시 시도해주세요.");
        }

        // 사업자등록증 업로드
        let licenseImageUrl: string | undefined;
        if (businessImageUri) {
          const asset: ImagePicker.ImagePickerAsset = {
            uri: businessImageUri,
            mimeType: 'image/jpeg',
            fileName: 'business-registration.jpg',
            width: 0,
            height: 0,
            assetId: null,
            base64: null,
            exif: null,
            duration: null,
            fileSize: undefined,
            type: 'image',
            pairedVideoAsset: undefined,
          };
          licenseImageUrl = await uploadImageAsset(asset);
        }

        // 점유신청 API 호출
        await createStoreClaimsMutation.mutateAsync({
          data: {
            storeId: savedStoreId,
            userId,
            bizRegNo: businessNumber,
            representativeName,
            storeName,
            storePhone,
            licenseImageUrl,
          },
        });

        await handleAuthSuccess(accessToken, expiresIn ?? 3600, role);
        logOwnerSignUpComplete();
        router.replace("/(shopowner)/auth/pending-approval");
        return;
      }

      // ROLE_GUEST인데 socialUserId가 없으면 일반 가입으로 절대 진행하지 않음
      if (authUserType === 'ROLE_GUEST') {
        Alert.alert("오류", "소셜 회원가입 정보를 찾을 수 없습니다. 처음부터 다시 시도해주세요.");
        return;
      }

      // 1️⃣ 일반 회원가입 API 호출
      const signupResponse = await signupOwnerMutation.mutateAsync({
        data: {
          username,
          password,
          name: representativeName,
          email: ownerEmail,
          gender: apiGender,
          birthDate,
        },
      });

      console.log("✅ 회원가입 성공:", signupResponse);
      const signupData = (signupResponse.data as any).data; // {accessToken, expiresIn}
      let userId: number | null = null;
      try {
        const signupPayload = JSON.parse(atob((signupData?.accessToken ?? "").split(".")[1]));
        userId = signupPayload?.sub ? parseInt(signupPayload.sub, 10) : null;
      } catch {}
      if (!userId) {
        throw new Error("사용자 정보를 확인할 수 없습니다.");
      }

      // 2️⃣ 로그인하여 토큰 발급
      const loginResponse = await login({ username, password });
      const loginData = (loginResponse.data as any).data;
      // handleAuthSuccess 대신 saveToken만 먼저 호출: setState를 아직 바꾸지 않아
      // _layout의 isOwner 조건이 true가 되지 않으므로 화면 전환이 일어나지 않는다.
      await saveToken(loginData.accessToken, loginData.expiresIn ?? 3600, "ROLE_OWNER");
      await saveCredentials(username, password);
      console.log("✅ 자동 로그인 성공");

      // 3️⃣ storeId 확인 (가게 검색으로 선택한 경우 savedStoreId 사용)
      if (!savedStoreId) {
        throw new Error("가게 정보를 찾을 수 없습니다. 가게 검색 후 다시 시도해주세요.");
      }
      const storeId = savedStoreId;

      // 4️⃣ 상점 소유 요청 (사업자등록증 업로드)
      let licenseImageUrl: string | undefined;
      if (businessImageUri) {
        const asset: ImagePicker.ImagePickerAsset = {
          uri: businessImageUri,
          mimeType: 'image/jpeg',
          fileName: 'business-registration.jpg',
          width: 0,
          height: 0,
          assetId: null,
          base64: null,
          exif: null,
          duration: null,
          fileSize: undefined,
          type: 'image',
          pairedVideoAsset: undefined,
        };
        licenseImageUrl = await uploadImageAsset(asset);
        console.log("✅ 사업자등록증 업로드 성공:", licenseImageUrl);
      }

      await createStoreClaimsMutation.mutateAsync({
        data: {
          storeId,
          userId,
          bizRegNo: businessNumber,
          representativeName,
          storeName,
          storePhone,
          licenseImageUrl,
        },
      });

      // 5️⃣ handleAuthSuccess 호출 → isAuthenticated = true → _layout에서 화면 전환
      // (store claim 생성 완료 후에 호출해야 중간에 언마운트되지 않음)
      await handleAuthSuccess(loginData.accessToken, loginData.expiresIn ?? 3600, "ROLE_OWNER");

      // 애널리틱스: 점주 가입 완료
      logOwnerSignUpComplete();
    } catch (error: any) {
      console.error("❌ 회원가입 실패:", error);
      Alert.alert(
        "회원가입 실패",
        error?.message || "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.canGoBack() ? router.back() : router.replace("/auth")} />
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
        {/* 가게 이름 (터치 시 검색 화면 이동) */}
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => router.push("/auth/store-select")}
          activeOpacity={0.7}
        >
          <ThemedText
            style={storeName ? styles.inputText : styles.inputPlaceholder}
          >
            {storeName || "가게 이름"}
          </ThemedText>
          <Ionicons name="search" size={rs(18)} color={Gray.gray9} />
        </TouchableOpacity>
        {savedStoreAddress ? (
          <ThemedText style={styles.storeAddress}>
            {savedStoreAddress}
          </ThemedText>
        ) : null}

        {/* 가게 전화번호 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="가게 전화번호"
            placeholderTextColor={TextColors.placeholder}
            value={storePhone}
            onChangeText={setStorePhone}
            keyboardType="phone-pad"
            maxLength={11}
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
            style={[styles.input, isBizVerified && styles.inputDisabled]}
            placeholder="사업자등록번호"
            placeholderTextColor={TextColors.placeholder}
            value={businessNumber}
            onChangeText={(text) => {
              setBusinessNumber(text);
              if (isBizVerified) setIsBizVerified(false);
            }}
            keyboardType="number-pad"
            maxLength={10}
            editable={!isBizVerified}
          />
          <TouchableOpacity
            style={[
              styles.verifyButton,
              isBizVerified ? styles.verifyButtonDisabled : styles.verifyButtonActive
            ]}
            onPress={handleVerifyBusiness}
            disabled={isBizVerified || isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color={Gray.white} />
            ) : (
              <ThemedText style={styles.verifyButtonText}>
                {isBizVerified ? "완료" : "확인"}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
        {isBizVerified && (
          <ThemedText style={styles.verifiedText}>✓ 사업자 정보 확인 완료</ThemedText>
        )}

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
          label={isSubmitting ? "처리 중..." : "회원가입"}
          backgroundColor={isFormValid && !isSubmitting ? Owner.primary : Gray.gray5}
          onPress={handleSignup}
          disabled={!isFormValid || isSubmitting}
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
  inputText: {
    flex: 1,
    fontSize: rs(14),
    color: TextColors.primary,
  },
  inputPlaceholder: {
    flex: 1,
    fontSize: rs(14),
    color: TextColors.placeholder,
  },
  storeAddress: {
    fontSize: rs(12),
    color: TextColors.tertiary,
    marginTop: rs(-4),
    paddingHorizontal: rs(4),
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
  verifyButton: {
    position: 'absolute',
    right: rs(4),
    top: '50%',
    transform: [{ translateY: -rs(17) }],
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: rs(6),
    minWidth: rs(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonActive: {
    backgroundColor: Owner.primary,
  },
  verifyButtonDisabled: {
    backgroundColor: Gray.gray5,
  },
  verifyButtonText: {
    fontSize: rs(12),
    fontWeight: '700',
    color: Gray.white,
  },
  inputDisabled: {
    backgroundColor: Gray.gray2,
    color: TextColors.tertiary,
  },
  verifiedText: {
    fontSize: rs(11),
    color: Owner.primary,
    marginTop: rs(-8),
    marginLeft: rs(4),
  },
  bottomContent: {
    paddingTop: rs(16),
  },
});
