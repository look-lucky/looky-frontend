import StudentIcon from "@/assets/images/onboarding/student.svg";
import OwnerIcon from "@/assets/images/onboarding/owner.svg";
import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Fonts, Gray } from "@/src/shared/theme/theme";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingMainPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* 캐릭터 + 로고 영역 */}
        <View style={styles.heroArea}>
          <Image
            source={require("@/assets/images/onboarding/character.png")}
            style={styles.characterImage}
            resizeMode="contain"
          />
          <ThemedText style={styles.logoText}>LOOKY</ThemedText>
        </View>

        {/* 질문 텍스트 */}
        <ThemedText style={styles.questionText}>
          루키를 어떻게 이용하실 예정인가요?
        </ThemedText>

        {/* 역할 선택 카드 */}
        <View style={styles.cardRow}>
          <Pressable
            style={styles.card}
            onPress={() => router.push("/onboarding/student")}
          >
            <StudentIcon width={rs(56)} height={rs(56)} />
            <ThemedText style={styles.cardLabel}>
              우리 학교 혜택을{"\n"}찾는 학생이에요
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.card, styles.cardOwner]}
            onPress={() => router.push("/onboarding/owner")}
          >
            <OwnerIcon width={rs(56)} height={rs(56)} />
            <ThemedText style={styles.cardLabel}>
              매장을 운영하는{"\n"}점주예요
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
    gap: rs(32),
  },
  heroArea: {
    alignItems: "center",
    gap: rs(8),
  },
  characterImage: {
    width: rs(120),
    height: rs(120),
  },
  logoText: {
    fontSize: rs(32),
    fontFamily: Fonts.bold,
    color: Brand.primary,
    letterSpacing: 2,
  },
  questionText: {
    fontSize: rs(16),
    fontFamily: Fonts.semiBold,
    color: Gray.black,
    textAlign: "center",
  },
  cardRow: {
    flexDirection: "row",
    gap: rs(16),
  },
  card: {
    flex: 1,
    backgroundColor: Gray.gray2,
    borderRadius: rs(16),
    paddingVertical: rs(20),
    alignItems: "center",
    gap: rs(12),
  },
  cardOwner: {
    backgroundColor: "#E8F5E9",
  },
  cardLabel: {
    fontSize: rs(13),
    fontFamily: Fonts.semiBold,
    color: Gray.black,
    textAlign: "center",
    lineHeight: rs(18),
  },
});
