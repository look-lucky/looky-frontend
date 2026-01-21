import { ArrowLeft } from "@/src/components/button/arrow-left";
import { rs } from "@/src/theme/scale";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SummaryRow = {
  label: string;
  value: string;
};

function SummaryCard({ rows }: { rows: SummaryRow[] }) {
  return (
    <View style={styles.card}>
      {rows.map((r, idx) => (
        <View key={`${r.label}-${idx}`} style={styles.cardRow}>
          <Text style={styles.cardLabel}>{r.label}</Text>
          <Text style={styles.cardValue} numberOfLines={2}>
            {r.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function SignupCompletePage() {
  const router = useRouter();
  const { nickname } = useLocalSearchParams<{ nickname?: string }>();
  const displayName = (nickname?.trim() || "(닉네임)") as string;

  // ✅ 예시 데이터 (실제론 이전 단계 state/params로 넣으면 됨)
  const rows: SummaryRow[] = [
    { label: "ID", value: "boywonderof" },
    { label: "PW", value: "chaeyoung is god 25@" },
    { label: "닉네임", value: "니어딜화이팅" },
    { label: "대학교", value: "전북대학교" },
    { label: "단과대학", value: "공과대학" },
    { label: "소속학과", value: "IT 융합기전학과" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
      </View>

      {/* Title */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>
          {`(${displayName})님,\n니어딜을 시작해보세요!`}
        </Text>
        <Text style={styles.subtitle}>
          우리학교의 숨겨진 행운을 찾아보세요!
        </Text>
      </View>

      {/* Card */}
      <View style={styles.cardWrap}>
        <SummaryCard rows={rows} />
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => {
            // TODO: 홈으로 이동 등
            router.replace("/"); // 너 프로젝트 라우트에 맞게 수정
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>니어딜 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(12),
    alignItems: "flex-start",
  },

  titleWrap: {
    paddingHorizontal: rs(24),
    marginTop: rs(6),
  },
  title: {
    fontSize: rs(22),
    fontWeight: "800",
    color: "#111111",
    fontFamily: "Pretendard",
    lineHeight: rs(30),
  },
  subtitle: {
    marginTop: rs(8),
    fontSize: rs(13),
    fontWeight: "500",
    color: "#B8B8B8",
    fontFamily: "Pretendard",
  },

  cardWrap: {
    paddingHorizontal: rs(24),
    marginTop: rs(18),
  },

  // ✅ 스샷 스펙 그대로: width 327, height 251, radius 15, bg #F6F6F6, padding 15
  card: {
    width: rs(327),
    height: rs(251),
    borderRadius: rs(15),
    backgroundColor: "#F6F6F6",
    padding: rs(15),
    justifyContent: "center",
    gap: rs(14),
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardLabel: {
    width: rs(64), // 왼쪽 라벨 컬럼 고정(정렬 깔끔)
    fontSize: rs(13),
    fontWeight: "700",
    color: "#9B9B9B",
    fontFamily: "Pretendard",
  },
  cardValue: {
    flex: 1,
    fontSize: rs(13),
    fontWeight: "800",
    color: "#111111",
    fontFamily: "Pretendard",
  },

  bottom: {
    marginTop: "auto",
    paddingHorizontal: rs(24),
    paddingBottom: rs(28),
  },
  ctaBtn: {
    height: rs(48),
    borderRadius: rs(10),
    backgroundColor: "#40CE2B",
    justifyContent: "center",
    alignItems: "center",
  },
  ctaText: {
    fontSize: rs(14),
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: "Pretendard",
  },
});
