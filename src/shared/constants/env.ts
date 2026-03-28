export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  ASSET_BASE_URL: process.env.EXPO_PUBLIC_ASSET_BASE_URL ?? "http://localhost:3845",
  NAVER_MAP_CLIENT_ID: process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID ?? "",
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "409232942871-dardm07iqdd0pfmhvjod9gnsets1g520.apps.googleusercontent.com",
  GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "1002437073594-b1jndcqkg68gdi923an4u8cupe5213rt.apps.googleusercontent.com",
  GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "1002437073594-iqpa9gs2j1nse2bs8fupb323hp7qia7a.apps.googleusercontent.com",
};
