import { useGetPopupAdvertisements } from "@/src/api/advertisement";
import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Gray } from "@/src/shared/theme/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const POPUP_HIDE_DATE_KEY = "HIDE_HOME_POPUP_DATE";

interface HomePopupProps {}

export function HomePopup({}: HomePopupProps) {
  const { width } = useWindowDimensions();
  const POPUP_WIDTH = width * 0.8;

  const [isVisible, setIsVisible] = useState(false);
  const { data: response, isLoading } = useGetPopupAdvertisements();

  const ads = (response as any)?.data?.data || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 팝업 표시 여부 -------------------------------------------------------------
  useEffect(() => {
    if (ads.length === 0) {
      setIsVisible(false);
      return;
    }
    checkPopupStatus();
  }, [ads.length]);

  const checkPopupStatus = async () => {
    try {
      const hideDate = await AsyncStorage.getItem(POPUP_HIDE_DATE_KEY);
      const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
      if (hideDate !== today) setIsVisible(true);
    } catch (e) {
      setIsVisible(true);
    }
  };

  const handleClose = () => setIsVisible(false);

  const handleHideToday = async () => {
    try {
      const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
      await AsyncStorage.setItem(POPUP_HIDE_DATE_KEY, today);
    } catch (e) {
      console.error("팝업 숨김 처리 실패:", e);
    } finally {
      setIsVisible(false);
    }
  };

  // 자동 로테이션 (Fade In/Out) -------------------------------------------------
  useEffect(() => {
    if (ads.length < 2 || !isVisible) return;

    const timer = setInterval(() => {
      // Fade Out: 300ms
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // 인덱스 변경 및 스크롤 이동 (애니메이션 없이 즉시 이동)
        setCurrentIndex((prev) => {
          const nextIndex = (prev + 1) % ads.length;
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: false });
          return nextIndex;
        });

        // Fade In: 300ms
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [ads.length, isVisible]);

  // 스와이프(슬라이드) 시 현재 인덱스 업데이트 --------------------------------------
  const onMomentumScrollEnd = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / POPUP_WIDTH);
    setCurrentIndex(newIndex);
  };

  // 렌더링 시작 ----------------------------------------------------------------
  if (isLoading || ads.length === 0) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.popupContainer, { width: POPUP_WIDTH }]}>
          {/* 광고 캐러셀 영역 */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <FlatList
              ref={flatListRef}
              data={ads}
              keyExtractor={(item, index) => item.id?.toString() || String(index)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.imagePlaceholder, { width: POPUP_WIDTH }]}
                  activeOpacity={item.landingUrl ? 0.8 : 1}
                  onPress={() => {
                    if (item.landingUrl) Linking.openURL(item.landingUrl);
                    // TODO: Google Analytics 클릭 추적 (ad_id: item.id)
                  }}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.adImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />
          </Animated.View>

          {/* 인디케이터 (2개 이상일 때만 표시) */}
          {ads.length > 1 && (
            <View style={styles.indicatorContainer}>
              {ads.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.indicatorDot,
                    currentIndex === idx && styles.indicatorDotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* 하단 버튼 영역 */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.hideTodayButton} onPress={handleHideToday}>
              <ThemedText style={styles.buttonText}>오늘 하루 그만 보기</ThemedText>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    backgroundColor: Gray.white,
    borderRadius: rs(12),
    overflow: "hidden",
  },
  imagePlaceholder: {
    aspectRatio: 3 / 4,
    backgroundColor: Gray.gray3,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  indicatorContainer: {
    position: "absolute",
    bottom: rs(60), // 하단 버튼영역 위쪽
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: rs(6),
  },
  indicatorDot: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: "rgba(0,0,0,0.3)",
    shadowColor: Gray.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
    elevation: 2,
  },
  indicatorDotActive: {
    backgroundColor: Gray.white,
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
