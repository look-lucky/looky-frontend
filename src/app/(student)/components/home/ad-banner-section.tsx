import { useGetBannerAdvertisements } from "@/src/api/advertisement";
import { rs } from "@/src/shared/theme/scale";
import { Gray } from "@/src/shared/theme/theme";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  AppState,
  Easing,
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

interface AdBannerProps { }

export function AdBannerSection({ }: AdBannerProps) {
  const { width } = useWindowDimensions();
  // 부모(index.tsx)가 좌우 패딩 rs(20)을 갖추고 있으므로
  const [bannerWidth, setBannerWidth] = useState<number>(width - rs(40));

  const { data: response, isLoading } = useGetBannerAdvertisements();
  const ads = (response as any)?.data?.data || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 타이머 활성화 상태 (포커스 & AppState)
  const [isActive, setIsActive] = useState(true);

  // 1. 탭 이동 / 다른 화면으로 이동 시 중지
  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => setIsActive(false);
    }, [])
  );

  // 2. 앱 백그라운드 전환 (링크 클릭 후 브라우저 이동 등) 시 중지
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    });
    return () => subscription.remove();
  }, []);

  // 자동 로테이션 (Fade In/Out) 타이머
  useEffect(() => {
    if (ads.length < 2 || !isActive) return;

    const timer = setInterval(() => {
      // Fade Out: 300ms
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // 순간적으로 다음 위치로 캐러셀 이동
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
  }, [ads.length, isActive]);

  // 터치 스케일 애니메이션 피드백 (100ms)
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // 딥링크 / URL 처리
  const handlePress = async (url?: string | null) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("안내", "페이지를 열 수 없습니다.");
      }
    } catch (e) {
      Alert.alert("안내", "올바르지 않은 링크입니다.");
    }
  };

  const onMomentumScrollEnd = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / bannerWidth);
    setCurrentIndex(newIndex);
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  if (isLoading || ads.length === 0) return null;

  return (
    <View
      style={styles.container}
      onLayout={(e) => setBannerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
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
            <Pressable
              style={[styles.bannerWrapper, { width: bannerWidth }]}
              onPressIn={item.landingUrl ? handlePressIn : undefined}
              onPressOut={item.landingUrl ? handlePressOut : undefined}
              onPress={() => handlePress(item.landingUrl)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.adImage} resizeMode="cover" />
            </Pressable>
          )}
        />
      </Animated.View>

      {/* 인디케이터 */}
      {ads.length > 1 && (
        <View style={styles.indicatorContainer}>
          {ads.map((_, idx) => (
            <Pressable
              key={idx}
              style={[
                styles.indicatorDot,
                currentIndex === idx && styles.indicatorDotActive,
              ]}
              onPress={() => handleDotPress(idx)}
              hitSlop={10}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    marginTop: rs(16),
    marginBottom: rs(0),
    width: "100%",
    height: rs(70),
    borderRadius: rs(8),
    overflow: "hidden",
    backgroundColor: Gray.gray3,
  },
  bannerWrapper: {
    height: "100%",
    overflow: "hidden",
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  indicatorContainer: {
    position: "absolute",
    bottom: rs(6),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: rs(4),
  },
  indicatorDot: {
    width: rs(5),
    height: rs(5),
    borderRadius: rs(2.5),
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
});
