import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT;
  const IS_DEV = variant === "development";
  const IS_PREVIEW = variant === "preview";
  const bundleId = IS_DEV
    ? "kr.looky.looky.dev"
    : IS_PREVIEW
      ? "kr.looky.looky.preview"
      : "kr.looky.looky";

  return {
    ...config,
    name: IS_DEV ? "Looky (Dev)" : IS_PREVIEW ? "Looky (Preview)" : "Looky",
    slug: "rn-app",
    owner: "looky123",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo/ios-looky.png",
    scheme: "rnapp",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleId,
    },
    android: {
      package: bundleId,
    adaptiveIcon: {
      backgroundColor: "#FEF5E5",
      foregroundImage: "./assets/images/logo/ios-looky.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-secure-store",
    [
      "@mj-studio/react-native-naver-map",
      {
        client_id: process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID ?? "",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          kotlinVersion: "2.1.20",
          extraMavenRepos: [
            "https://repository.map.naver.com/archive/maven",
            "https://devrepo.kakao.com/nexus/content/groups/public/",
          ],
        },
      },
    ],
    "expo-web-browser",
    "expo-image-picker",
    "@react-native-community/datetimepicker",
    [
      "@react-native-seoul/kakao-login",
      {
        kakaoAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? "",
      },
    ],
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: "com.googleusercontent.apps.409232942871-dardm07iqdd0pfmhvjod9gnsets1g520",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  updates: {
    url: "https://u.expo.dev/554fbeb0-4c38-4f44-86c2-6591b905ee36",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  extra: {
    router: {},
    eas: {
      projectId: "554fbeb0-4c38-4f44-86c2-6591b905ee36",
    },
  },
  };
};
