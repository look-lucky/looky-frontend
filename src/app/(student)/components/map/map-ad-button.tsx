import { useGetFloatingAdvertisements } from "@/src/api/advertisement";
import { rs } from "@/src/shared/theme/scale";
import { Gray } from "@/src/shared/theme/theme";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Alert, Image, Linking, StyleSheet, TouchableOpacity } from "react-native";

interface MapAdButtonProps {
  bottomPosition: number;
}

export function MapAdButton({ bottomPosition }: MapAdButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isFirstLoad = useRef(true);

  const { data: response, isLoading } = useGetFloatingAdvertisements();

  const ads = (response as any)?.data?.data || [];
  const currentAd = ads.length > 0 ? ads[currentIndex % ads.length] : null;

  useFocusEffect(
    useCallback(() => {
      // API 응답 데이터가 없으면 표시하지 않음
      if (ads.length === 0) {
        setIsVisible(false);
        return;
      }

      // 맵 화면에 다시 들어올 때마다 인덱스 교체 (단, 최초 로드 시점은 index 0 유지)
      if (!isFirstLoad.current) {
        if (ads.length > 1) {
          setCurrentIndex((prev) => (prev + 1) % ads.length);
        }
      } else {
        isFirstLoad.current = false;
      }

      setIsVisible(true);

      // 20초 뒤에 자동으로 가리도록 타이머 설정
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 20000);

      // 다른 화면(탭)으로 넘어갔을 때 중복 타이머 해제
      return () => clearTimeout(timer);
    }, [ads.length])
  );

  // 딥링크 및 외부 브라우저 핸들링
  const handlePress = async (url: string) => {
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

  // 노출 조건 미달이거나 타이머 종료 시 렌더링 제거
  if (isLoading || !currentAd || !isVisible) return null;

  const { imageUrl, landingUrl } = currentAd;

  return (
    <TouchableOpacity
      style={[styles.container, { bottom: bottomPosition }]}
      disabled={!landingUrl} // URL이 없으면 아예 터치 이벤트와 피드백 무시
      activeOpacity={0.8}
      onPress={() => {
        if (landingUrl) handlePress(landingUrl);
        // TODO: Google Analytics 클릭 통계 (ad_id: currentAd?.id)
      }}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.adImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    backgroundColor: Gray.gray3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Gray.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
});
