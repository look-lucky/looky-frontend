import { AppButton } from "@/src/shared/common/app-button";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Gray, Text as TextColors } from "@/src/shared/theme/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Polyline } from "react-native-svg";

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <Svg width={rs(20)} height={rs(20)} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 1.5C5.3 1.5 1.5 5.3 1.5 10S5.3 18.5 10 18.5 18.5 14.7 18.5 10 14.7 1.5 10 1.5z"
        stroke={checked ? Brand.primary : Gray.gray5}
        strokeWidth={1.5}
        fill={checked ? Brand.primary : "none"}
      />
      <Polyline
        points="6.5,10 9,12.5 13.5,7.5"
        stroke={checked ? Gray.white : Gray.gray5}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={rs(16)} height={rs(16)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={Gray.gray5}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function SignUpAgreePage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string; userId?: string; provider?: string }>();

  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);

  const allChecked = termsChecked && privacyChecked && ageChecked;

  const toggleAll = () => {
    const next = !allChecked;
    setTermsChecked(next);
    setPrivacyChecked(next);
    setAgeChecked(next);
  };

  const handleNext = () => {
    if (!allChecked) return;

    if (params.from === "social" && params.userId && params.provider) {
      router.push({
        pathname: "/auth/sign-up-social-form",
        params: { userId: params.userId, provider: params.provider },
      });
    } else {
      router.push("/auth/sign-up-form");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
      </View>

      <View style={styles.content}>
        <ThemedText type="subtitle" style={styles.title}>
          <ThemedText type="subtitle" lightColor={Brand.primary}>
            루키
          </ThemedText>
          {" "}이용을 위해{"\n"}동의가 필요해요
        </ThemedText>

        {/* 전체 동의 */}
        <TouchableOpacity style={styles.allAgreeBox} onPress={toggleAll} activeOpacity={0.8}>
          <CheckIcon checked={allChecked} />
          <View style={styles.allAgreeTextBox}>
            <ThemedText type="defaultSemiBold" style={styles.allAgreeTitle}>
              전체 동의
            </ThemedText>
            <ThemedText style={styles.allAgreeDesc}>
              서비스 이용에 필수적인 최소한의 개인정보 수집 및 이용, 본인확인, 위치정보 수집 및 이용, 광고성 정보 수신(선택) 및 마케팅 정보 수신(선택) 동의를 포함합니다
            </ThemedText>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* 서비스 이용약관 */}
        <View style={styles.itemRow}>
          <TouchableOpacity
            style={styles.itemLeft}
            onPress={() => setTermsChecked((v) => !v)}
            activeOpacity={0.8}
          >
            <CheckIcon checked={termsChecked} />
            <ThemedText style={styles.itemLabel}>
              <ThemedText style={styles.required}>(필수) </ThemedText>
              서비스 이용약관
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/auth/terms-detail?type=terms")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        {/* 개인정보 수집 및 이용 */}
        <View style={styles.itemRow}>
          <TouchableOpacity
            style={styles.itemLeft}
            onPress={() => setPrivacyChecked((v) => !v)}
            activeOpacity={0.8}
          >
            <CheckIcon checked={privacyChecked} />
            <ThemedText style={styles.itemLabel}>
              <ThemedText style={styles.required}>(필수) </ThemedText>
              개인정보 수집 및 이용
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/auth/terms-detail?type=privacy")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        {/* 만 14세 이상 */}
        <TouchableOpacity
          style={styles.itemRow}
          onPress={() => setAgeChecked((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={styles.itemLeft}>
            <CheckIcon checked={ageChecked} />
            <ThemedText style={styles.itemLabel}>
              <ThemedText style={styles.required}>(필수) </ThemedText>
              만 14세 이상입니다
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.bottom}>
        <AppButton
          label="회원가입"
          backgroundColor={allChecked ? Brand.primary : Gray.gray5}
          onPress={handleNext}
          disabled={!allChecked}
        />
      </View>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: rs(24),
    paddingTop: rs(16),
    gap: rs(20),
  },
  title: {
    color: TextColors.primary,
    lineHeight: rs(34),
  },
  allAgreeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rs(12),
    paddingVertical: rs(16),
    paddingHorizontal: rs(16),
    backgroundColor: Gray.gray2,
    borderRadius: rs(12),
  },
  allAgreeTextBox: {
    flex: 1,
    gap: rs(4),
  },
  allAgreeTitle: {
    color: TextColors.primary,
    fontSize: rs(15),
  },
  allAgreeDesc: {
    color: TextColors.secondary,
    fontSize: rs(11),
    lineHeight: rs(16),
  },
  divider: {
    height: 1,
    backgroundColor: Gray.gray3,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: rs(4),
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
    flex: 1,
  },
  itemLabel: {
    color: TextColors.primary,
    fontSize: rs(14),
  },
  required: {
    color: TextColors.secondary,
    fontSize: rs(14),
  },
  bottom: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(40),
    paddingTop: rs(16),
  },
});
