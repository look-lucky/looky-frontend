import { AuthProvider } from "@/src/lib/auth";
import { TabBarProvider } from "@/src/contexts/tab-bar-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Pretendard-Regular": require("@/assets/font/pretendard/Pretendard-Regular.ttf"),
    "Pretendard-Medium": require("@/assets/font/pretendard/Pretendard-Medium.ttf"),
    "Pretendard-SemiBold": require("@/assets/font/pretendard/Pretendard-SemiBold.ttf"),
    "Pretendard-Bold": require("@/assets/font/pretendard/Pretendard-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TabBarProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="landing" />
              <Stack.Screen name="signin" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <StatusBar style="auto" />
          </TabBarProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
