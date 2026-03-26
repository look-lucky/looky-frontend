import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Gray } from "@/src/shared/theme/theme";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface MapAdButtonProps {
  bottomPosition: number;
}

export function MapAdButton({ bottomPosition }: MapAdButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { bottom: bottomPosition }]}
      activeOpacity={0.8}
    >
      {/* 백엔드 API 연동 전 임시 영역 */}
      <ThemedText style={styles.text}>AD</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22), // 내 위치보기 버튼과 동일한 원형
    backgroundColor: Gray.gray3, // 임시 회색 배경
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Gray.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: rs(12),
    fontWeight: "700",
    color: Gray.gray6,
  },
});
