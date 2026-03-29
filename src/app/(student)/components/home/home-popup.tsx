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

interface HomePopupProps { }

export function HomePopup({ }: HomePopupProps) {
  const { width } = useWindowDimensions();
  const POPUP_WIDTH = width * 0.9; // 좌우 여백을 줄임 (가록폭을 넓힘) 0.85 -> 0.9

  const [isVisible, setIsVisible] = useState(false);
  const { data: response, isLoading } = useGetPopupAdvertisements();

  const ads = (response as any)?.data?.data || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 팝업 표시 여부 로직
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

  // 자동 페이드 인/아웃 타이머
  useEffect(() => {
    if (ads.length < 2 || !isVisible) return;

    const timer = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => {
          const nextIndex = (prev + 1) % ads.length;
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: false });
          return nextIndex;
        });

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

  const onMomentumScrollEnd = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / POPUP_WIDTH);
    setCurrentIndex(newIndex);
  };

  if (isLoading || ads.length === 0) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={{ width: POPUP_WIDTH }}>
          {/* 이미지 캐러셀 컨테이너 (둥근 모서리 적용) */}
          <View style={[styles.carouselWrapper, { width: POPUP_WIDTH }]}>
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
                      // TODO: Google Analytics
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

            {/* 인디케이터 (2개 이상일 때만, 캐러셀 이미지 하단 영역에 배치) */}
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
          </View>

          {/* 하단 투명 버튼 영역 (배경 없이 텍스트만 양 끝 배치) */}
          <View style={styles.buttonContainer}>
            <Pressable onPress={handleHideToday} hitSlop={10}>
              <ThemedText style={styles.buttonText}>하루동안 보지 않기</ThemedText>
            </Pressable>
            <Pressable onPress={handleClose} hitSlop={10}>
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
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: rs(60), // 위치를 하단으로 내리기 위해 간격 조정
  },
  carouselWrapper: {
    borderRadius: rs(16),
    overflow: "hidden", // 이미지가 모서리를 넘어가지 않게 자름
    backgroundColor: Gray.gray3,
  },
  imagePlaceholder: {
    aspectRatio: 1.30, // 높이를 조금 더 줄임 (위아래로 납작해짐)
    justifyContent: "center",
    alignItems: "center",
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  indicatorContainer: {
    position: "absolute",
    bottom: rs(12),
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
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: rs(8), // 사진과 글자 간격 줄임 (16 -> 8)
  },
  buttonText: {
    fontSize: rs(14),
    fontWeight: "500",
    color: Gray.white,
  },
});
