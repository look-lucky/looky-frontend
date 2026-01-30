import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useCallback, useEffect, useState } from "react";

import { ENV } from "@/src/shared/constants/env";

export function useGoogleLogin() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    });
    setIsReady(true);
  }, []);

  const login = useCallback(async () => {
    try {
      setIsLoading(true);

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        console.log("=== 구글 로그인 성공 ===");
        console.log("ID Token:", response.data.idToken);
        console.log("User:", response.data.user);

        // TODO: 이 토큰을 백엔드로 보내서 우리 JWT 받기
        return response.data;
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log("구글 로그인 취소됨");
            break;
          case statusCodes.IN_PROGRESS:
            console.log("구글 로그인 진행 중");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.error("Play Services 사용 불가");
            break;
          default:
            console.error("구글 로그인 에러:", error);
        }
      } else {
        console.error("구글 로그인 에러:", error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
      console.log("구글 로그아웃 완료");
    } catch (error) {
      console.error("구글 로그아웃 에러:", error);
    }
  }, []);

  return {
    login,
    logout,
    isLoading,
    isReady,
  };
}
