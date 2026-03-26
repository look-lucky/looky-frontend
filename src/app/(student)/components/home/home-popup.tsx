import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Gray } from "@/src/shared/theme/theme";

const POPUP_HIDE_DATE_KEY = "HIDE_HOME_POPUP_DATE";

export function HomePopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkPopupStatus();
  }, []);

  const checkPopupStatus = async () => {
    try {
      const hideDate = await AsyncStorage.getItem(POPUP_HIDE_DATE_KEY);
      // 한국 시간 기준으로 오늘 날짜 문자열 만들기 (예: "2026. 3. 26.")
      const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
      
      // 저장된 날짜가 오늘 날짜와 다르면 팝업 표시
      if (hideDate !== today) {
        setIsVisible(true);
      }
    } catch (e) {
      // 에러 시 기본으로 보여줌
      setIsVisible(true);
    }
  };

  const handleClose = () => {
    // 세션 내에서만 숨김 처리 (앱 재시작시 다시 표시됨)
    setIsVisible(false);
  };

  const handleHideToday = async () => {
    try {
      const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
      await AsyncStorage.setItem(POPUP_HIDE_DATE_KEY, today);
      setIsVisible(false);
    } catch (e) {
      console.error("팝업 숨김 처리 실패:", e);
      setIsVisible(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          {/* 배너 이미지 임시 뷰 영역 */}
          <View style={styles.imagePlaceholder}>
            <ThemedText style={styles.placeholderText}>
              전면 광고 팝업 영역
            </ThemedText>
            <ThemedText style={styles.placeholderSubText}>
              (API 연동 시 진짜 이미지로 교체)
            </ThemedText>
          </View>

          {/* 하단 버튼 영역 */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.hideTodayButton} onPress={handleHideToday}>
              <ThemedText style={styles.buttonText}>
                오늘 하루 그만 보기
              </ThemedText>
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <ThemedText style={styles.buttonText}>닫기</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)", // 반투명 검은색 배경
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: "80%",
    backgroundColor: Gray.white,
    borderRadius: rs(12),
    overflow: "hidden", // 모서리 둥글게 깎기 적용
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 3 / 4, // 팝업 전면광고의 일반적인 세로 4: 가로 3 비율
    backgroundColor: Gray.gray3,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: rs(16),
    fontWeight: "700",
    color: Gray.gray7,
  },
  placeholderSubText: {
    fontSize: rs(12),
    color: Gray.gray5,
    marginTop: rs(8),
  },
  buttonContainer: {
    flexDirection: "row",
    height: rs(48),
    borderTopWidth: 1,
    borderTopColor: Gray.gray3,
  },
  hideTodayButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: "100%",
    backgroundColor: Gray.gray3,
  },
  buttonText: {
    fontSize: rs(14),
    fontWeight: "500",
    color: Gray.gray7,
  },
});
