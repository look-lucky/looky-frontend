import NearDealLogo from "@/assets/images/logo/neardeal-logo.svg";
import { useSend, useVerify } from "@/src/api/auth";
import { AppButton } from "@/src/shared/common/app-button";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useSignupStore } from "@/src/shared/stores/signup-store";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Gray, Owner, System, Text as TextColors } from "@/src/shared/theme/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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

type UserType = "student" | "owner" | null;
type Gender = "male" | "female";

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

export default function SocialSignupFormPage() {
  const router = useRouter();
  const { userId, provider } = useLocalSearchParams<{
    userId: string;
    provider: string;
  }>();
  const setSignupFields = useSignupStore((state) => state.setSignupFields);

  const sendEmailMutation = useSend();
  const verifyEmailMutation = useVerify();

  const [userType, setUserType] = useState<UserType>(null);
  const [gender, setGender] = useState<Gender>("male");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");

  // 학생 전용
  const [nickname, setNickname] = useState("");

  // 점주 전용
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const isStudent = userType === "student";
  const primaryColor = userType === "owner" ? Owner.primary : Brand.primary;

  const isFormValid = () => {
    if (!userType) return false;

    const commonValid =
      birthYear.length === 4 &&
      birthMonth.length >= 1 &&
      birthDay.length >= 1;

    if (isStudent) {
      return commonValid && nickname.length >= 2 && nickname.length <= 10;
    } else {
      return commonValid && isEmailVerified;
    }
  };

  const handleRequestEmailCode = async () => {
    if (!email) return;
    try {
      await sendEmailMutation.mutateAsync({ data: { email } });
      Alert.alert("인증번호 발송", "이메일로 인증번호가 발송되었습니다.");
    } catch (error: any) {
      Alert.alert("발송 실패", error?.message || "인증번호 발송에 실패했습니다.");
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!email || !emailCode) return;
    try {
      await verifyEmailMutation.mutateAsync({ data: { email, code: emailCode } });
      setIsEmailVerified(true);
      Alert.alert("인증 성공", "이메일 인증이 완료되었습니다.");
    } catch (error: any) {
      Alert.alert("인증 실패", error?.message || "인증번호가 일치하지 않습니다.");
    }
  };

  const handleNext = () => {
    if (!isFormValid() || !userType) return;

    setSignupFields({
      userType,
      gender,
      birthYear,
      birthMonth,
      birthDay,
      nickname,
      ownerEmail: email,
      socialUserId: userId ?? "",
      socialProvider: provider ?? "",
    });

    if (userType === "owner") {
      router.push("/auth/sign-up-owner");
    } else {
      router.push("/auth/sign-up-verify");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
      </View>

      <View style={styles.topContent}>
        <ThemedText style={styles.subtitle}>우리대학 제휴혜택이 궁금할 땐?</ThemedText>
        <NearDealLogo width={169} height={57} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 가입 유형 */}
        <View style={styles.fieldGroup}>
          <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
            가입 유형
          </ThemedText>
          <View style={styles.radioGroup}>
            <RadioButton
              selected={userType === "student"}
              label="대학생"
              onPress={() => setUserType("student")}
              activeColor={Brand.primary}
            />
            <RadioButton
              selected={userType === "owner"}
              label="점주"
              onPress={() => setUserType("owner")}
              activeColor={Owner.primary}
            />
          </View>
        </View>

        {userType && (
          <>
            {/* 성별 */}
            <View style={styles.fieldGroup}>
              <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
                성별
              </ThemedText>
              <View style={styles.radioGroup}>
                <RadioButton
                  selected={gender === "male"}
                  label="남자"
                  onPress={() => setGender("male")}
                  activeColor={primaryColor}
                />
                <RadioButton
                  selected={gender === "female"}
                  label="여자"
                  onPress={() => setGender("female")}
                  activeColor={primaryColor}
                />
              </View>
            </View>

            {/* 생년월일 */}
            <View style={styles.fieldGroup}>
              <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
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

            {/* 학생 전용: 닉네임 */}
            {isStudent && (
              <View style={styles.inputGroup}>
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
            )}

            {/* 점주 전용: 이메일 인증 */}
            {!isStudent && (
              <>
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="이메일"
                      placeholderTextColor={TextColors.placeholder}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="이메일 인증번호"
                      placeholderTextColor={TextColors.placeholder}
                      value={emailCode}
                      onChangeText={setEmailCode}
                      keyboardType="number-pad"
                    />
                    <TouchableOpacity
                      style={[
                        styles.smallButton,
                        { backgroundColor: email ? Owner.primary : Gray.gray5 },
                      ]}
                      onPress={emailCode ? handleVerifyEmailCode : handleRequestEmailCode}
                      disabled={!email}
                    >
                      <ThemedText style={styles.smallButtonText}>
                        {emailCode ? "확인" : "인증요청"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.bottomContent}>
        <AppButton
          label="다음으로"
          backgroundColor={isFormValid() ? primaryColor : Gray.gray5}
          onPress={handleNext}
          disabled={!isFormValid()}
        />
      </View>
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
  topContent: {
    gap: rs(4),
    marginBottom: rs(24),
  },
  subtitle: {
    fontSize: rs(14),
    color: Gray.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: rs(16),
    paddingBottom: rs(20),
  },
  fieldGroup: {
    gap: rs(8),
  },
  fieldLabel: {
    fontSize: rs(14),
    color: Gray.black,
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
    height: rs(40),
    borderWidth: 1,
    borderColor: Gray.gray4,
    borderRadius: rs(8),
    paddingHorizontal: rs(12),
    fontSize: rs(14),
    color: TextColors.primary,
    textAlign: "center",
  },
  inputGroup: {
    gap: rs(6),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Gray.gray4,
    borderRadius: rs(8),
    paddingHorizontal: rs(16),
    height: rs(40),
  },
  input: {
    flex: 1,
    fontSize: rs(14),
    color: TextColors.primary,
  },
  smallButton: {
    paddingHorizontal: rs(8),
    borderRadius: rs(8),
    height: rs(28),
    minWidth: rs(76),
    justifyContent: "center",
    alignItems: "center",
  },
  smallButtonText: {
    fontSize: rs(12),
    fontWeight: "700",
    color: Gray.white,
  },
  bottomContent: {
    paddingTop: rs(16),
  },
});
