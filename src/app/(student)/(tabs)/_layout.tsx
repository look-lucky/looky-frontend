import { HomeIcons } from "@/assets/images/icons/home";
import { useTabBar } from "@/src/shared/contexts/tab-bar-context";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, BackHandler } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { isTabBarVisible } = useTabBar();
  const router = useRouter();

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (router.canGoBack()) {
        return false;
      }
      Alert.alert("앱 종료", "앱을 종료하시겠습니까?", [
        { text: "취소", style: "cancel" },
        { text: "종료", style: "destructive", onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    });
    return () => subscription.remove();
  }, [router]);
  const tabBarHeight = 56 + insets.bottom;

  // 애니메이션 값: 0 = 보임, tabBarHeight = 숨김 (아래로 슬라이드)
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(isTabBarVisible ? 0 : tabBarHeight, {
      duration: 250,
    });
  }, [isTabBarVisible, tabBarHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#34b262",
        tabBarInactiveTintColor: "#1d1b20",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
      }}
      tabBar={(props) => (
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
            },
            animatedStyle,
          ]}
        >
          <BottomTabBar {...props} />
        </Animated.View>
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <HomeIcons.home width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <HomeIcons.location width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="benefits"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <HomeIcons.gift width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <HomeIcons.person width={size} height={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
