import * as KakaoLogin from "@react-native-seoul/kakao-login";
import { useCallback, useState } from "react";

export function useKakaoLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async () => {
    try {
      setIsLoading(true);

      // 카카오톡 앱으로 로그인 (앱 없으면 웹으로 폴백)
      const result = await KakaoLogin.login();

      console.log("=== 카카오 로그인 성공 ===");
      console.log("Access Token:", result.accessToken);
      console.log("ID Token:", result.idToken);
      console.log("Refresh Token:", result.refreshToken);

      // TODO: 이 토큰을 백엔드로 보내서 우리 JWT 받기
      return result;
    } catch (error: any) {
      if (error.code === "E_CANCELLED_OPERATION") {
        console.log("카카오 로그인 취소됨");
      } else {
        console.error("카카오 로그인 에러:", error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await KakaoLogin.logout();
      console.log("카카오 로그아웃 완료");
    } catch (error) {
      console.error("카카오 로그아웃 에러:", error);
    }
  }, []);

  return {
    login,
    logout,
    isLoading,
    isReady: true, // 네이티브 SDK는 항상 ready
  };
}
