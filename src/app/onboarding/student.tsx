import { AppButton } from "@/src/shared/common/app-button";
import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Fonts, Gray } from "@/src/shared/theme/theme";
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
    subtitle: "여기저기 흩어져 있던 학교 혜택들",
    title: "루키에서 한 눈에 확인해요!",
    image: require("@/assets/images/onboarding/student-home.png"),
  },
  {
    id: "2",
    subtitle: "카페, 음식점, 문화시설까지",
    title: "우리 학교 제휴 혜택을 만나보세요",
    image: require("@/assets/images/onboarding/student-map.png"),
  },
  {
    id: "3",
    subtitle: "실시간으로 만나보는",
    title: "캠퍼스 내 다양한 행사들!",
    image: require("@/assets/images/onboarding/student-map-2.png"),
  },
  {
    id: "4",
    subtitle: "우리 대학가 사장님이 제공하는",
    title: "행운의 쿠폰 놓치지 마세요!",
    image: require("@/assets/images/onboarding/student-store.png"),
  },
  {
    id: "5",
    subtitle: "",
    title: "시작해보세요!",
    image: require("@/assets/images/onboarding/start.png"),
  },
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleComplete = useCallback(async () => {
    await AsyncStorage.setItem("onboarding_completed", "true");
    router.replace("/auth");
  }, [router]);

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleComplete();
    }
  }, [currentIndex, handleComplete]);

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
          backgroundColor={Brand.primary}
          onPress={handleNext}
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
    backgroundColor: Brand.primary,
  },
  dotInactive: {
    backgroundColor: Gray.gray3,
  },
  loginButton: {
    width: rs(200),
    paddingVertical: rs(12),
  },
});
