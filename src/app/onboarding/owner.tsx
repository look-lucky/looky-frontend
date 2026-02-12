import { AppButton } from "@/src/shared/common/app-button";
import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Fonts, Gray, Owner } from "@/src/shared/theme/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
  type ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES: {
  id: string;
  subtitle: string;
  title: string;
  image: ImageSourcePropType;
}[] = [
  {
    id: "1",
    subtitle: "쿠폰 사용, 운영 성과 등",
    title: "가게 반응을 한 눈에 확인하세요",
    image: require("@/assets/images/onboarding/owner-home.png"),
  },
  {
    id: "2",
    subtitle: "타임딜 쿠폰으로",
    title: "더 많은 손님을 만나보세요",
    image: require("@/assets/images/onboarding/owner-coupon.png"),
  },
  {
    id: "3",
    subtitle: "우리 가게를 방문한 학생들의",
    title: "리뷰를 확인하고 소통해요",
    image: require("@/assets/images/onboarding/owner-store.png"),
  },
  {
    id: "4",
    subtitle: "손님에게 전하고 싶은 소식을",
    title: "지금 바로 공유해주세요!",
    image: require("@/assets/images/onboarding/owner-news.png"),
  },
  {
    id: "5",
    subtitle: "",
    title: "시작해보세요!",
    image: require("@/assets/images/onboarding/start.png"),
  },
];

export default function OwnerOnboardingPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleComplete = useCallback(async () => {
    await AsyncStorage.setItem("onboarding_completed", "true");
    router.replace("/auth");
  }, [router]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderSlide = ({ item }: { item: (typeof SLIDES)[number] }) => (
    <View style={styles.slide}>
      {/* 타이틀 영역 */}
      <View style={styles.titleArea}>
        <ThemedText style={styles.subtitle}>{item.subtitle}</ThemedText>
        <ThemedText style={styles.title}>{item.title}</ThemedText>
      </View>

      {/* 슬라이드 이미지 */}
      <Image
        source={item.image}
        style={styles.slideImage}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* 건너뛰기 버튼 */}
      <View style={styles.header}>
        <Pressable onPress={handleComplete} hitSlop={12}>
          <ThemedText style={styles.skipText}>건너뛰기</ThemedText>
        </Pressable>
      </View>

      {/* 슬라이드 */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.flatList}
      />

      {/* 하단: 페이지네이션 + 버튼 */}
      <View style={styles.bottomArea}>
        {/* 페이지네이션 dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <AppButton
          label={currentIndex === SLIDES.length - 1 ? "🍀 루키 시작하기" : "다음으로"}
          backgroundColor={Owner.primary}
          onPress={handleComplete}
          style={styles.loginButton}
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
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: rs(24),
    paddingVertical: rs(12),
  },
  skipText: {
    fontSize: rs(14),
    fontFamily: Fonts.medium,
    color: Gray.gray6,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: rs(24),
    gap: rs(24),
  },
  titleArea: {
    alignItems: "center",
    gap: rs(4),
  },
  subtitle: {
    fontSize: rs(16),
    fontFamily: Fonts.medium,
    color: Gray.black,
    textAlign: "center",
  },
  title: {
    fontSize: rs(20),
    fontFamily: Fonts.bold,
    color: Gray.black,
    textAlign: "center",
  },
  slideImage: {
    flex: 1,
    width: "100%",
    borderRadius: rs(20),
  },
  bottomArea: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(24),
    gap: rs(20),
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    gap: rs(8),
  },
  dot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
  },
  dotActive: {
    backgroundColor: Owner.primary,
  },
  dotInactive: {
    backgroundColor: Gray.gray3,
  },
  loginButton: {
    width: rs(200),
    paddingVertical: rs(12),
  },
});
