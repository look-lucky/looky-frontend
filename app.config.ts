import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT;
  const IS_DEV = variant === "development";
  const IS_PREVIEW = variant === "preview";

  // dev 빌드는 별도 Bundle ID를 사용하여 기기에 prod/dev 동시 설치 가능
  // 단, Google Cloud Console에 kr.looky.looky.dev 로 등록된 OAuth 클라이언트 ID가 있어야 함
  const bundleId = IS_DEV ? "kr.looky.looky.dev" : "kr.looky.looky";

  return {
    ...config,
    name: IS_DEV ? "Looky (Dev)" : IS_PREVIEW ? "Looky (Preview)" : "Looky",
    slug: "rn-app",
    owner: "looky123",
    version: "1.1.0",
    orientation: "portrait",
    icon: "./assets/images/logo/ios-looky.png",
    // 구글 로그인 scheme은 아래 플러그인(google-signin)에서 자동으로 추가하므로 중복 방지를 위해 제거
    scheme: ["rnapp", "looky"],
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      supportsTablet: false,
      bundleIdentifier: bundleId,
      buildNumber: "2",
      usesAppleSignIn: true,
      googleServicesFile: "./GoogleService-Info.plist",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "사용자의 현재 위치를 중심으로 내 주변의 대학 제휴 매장, 실시간 이벤트 팝업, 할인 혜택을 지도상에 표시하고 해당 매장까지의 거리를 안내하기 위해 위치 정보가 필요합니다.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "사용자의 현재 위치를 중심으로 내 주변의 대학 제휴 매장, 실시간 이벤트 팝업, 할인 혜택을 지도상에 표시하고 해당 매장까지의 거리를 안내하기 위해 위치 정보가 필요합니다.",
        NSPhotoLibraryUsageDescription:
          "학생 회원의 제휴 매장 리뷰 사진 첨부 및 파트너 회원(점주)의 가입용 사업자등록증 제출, 매장 배너/메뉴 이미지 등록을 위해 기기의 사진첩 접근 권한이 필요합니다.",
        NSPhotoLibraryAddUsageDescription:
          "학생 회원의 제휴 매장 리뷰 사진 첨부 및 파트너 회원(점주)의 가입용 사업자등록증 제출, 매장 배너/메뉴 이미지 등록을 위해 기기의 사진첩 접근 권한이 필요합니다.",
        NSCameraUsageDescription:
          "학생 회원의 리뷰 사진 촬영 및 파트너 회원(점주)의 사업자등록증, 매장 메뉴 사진을 직접 촬영하여 등록하기 위해 카메라 접근 권한이 필요합니다.",
        LSApplicationQueriesSchemes: [
          "nmap",
          "kakaomap",
          "comgooglemaps",
          "googlemaps",
          "kakaokompassauth", // 카카오 로그인용 필수
          "kakaolink",        // 카카오 로그인/공유용 필수
          "kakaotalk",
        ],
      },
    },
    android: {
      package: bundleId,
      versionCode: 2,
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        backgroundColor: "#FEF5E5",
        foregroundImage: "./assets/images/logo/android-looky.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "./plugins/withTabletRestriction",
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo/ios-looky.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#FEF5E5",
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
          ios: {
            useFrameworks: "static",
            buildReactNativeFromSource: true,
          },
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
          iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME ?? "com.googleusercontent.apps.1002437073594-iqpa9gs2j1nse2bs8fupb323hp7qia7a",
        },
      ],
      "@react-native-firebase/app",
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "react-native",
          organization: "looky-ub",
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
