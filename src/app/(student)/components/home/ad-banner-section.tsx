import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Gray } from "@/src/shared/theme/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

export function AdBannerSection() {
  return (
    <View style={styles.container}>
      {/* 백엔드 연동 전 임시 회색 배너 박스 */}
      <View style={styles.bannerBox}>
        <ThemedText style={styles.placeholderText}>
          광고 배너 영역
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: rs(16),
  },
  bannerBox: {
    width: "100%",
    height: rs(70),
    backgroundColor: Gray.gray3,
    borderRadius: rs(8),
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: Gray.gray6,
    fontSize: rs(14),
    fontWeight: "600",
  },
});
