import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useCallback, useState } from "react";
import { Platform } from "react-native";
import * as Sentry from "@sentry/react-native";

import { googleLogin } from "@/src/api/auth";
import { ENV } from "@/src/shared/constants/env";
import { useAuth } from "./auth-context";
import type { UserType } from "./token";
import { saveLoginProvider } from "./token";

interface SocialLoginResult {
  success: boolean;
  needsSignup?: boolean;
  userId?: number;
  error?: string;
}

function decodeJwtPayload(token: string): { role?: string; sub?: string } | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// 🔥 [CRITICAL FIX] Hook 내부의 useEffect가 아닌, 파일 최상단(Global)으로 완전히 이동!
// JS 번들이 켜지자마자 즉시 1회만 설정을 완료하여 버튼 클릭 시점의 타이밍 크래시를 방지합니다.
GoogleSignin.configure({
  webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
  iosClientId: ENV.GOOGLE_IOS_CLIENT_ID,
});

export function useGoogleLogin() {
  const { handleAuthSuccess } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isReady = true;

  // ❌ 에러의 원인이었던 useEffect 지연 초기화 블록은 완전히 삭제되었습니다.

  const login = useCallback(async (): Promise<SocialLoginResult> => {
    try {
      setIsLoading(true);

      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response) || !response.data.idToken) {
        return { success: false, error: "구글 로그인 실패" };
      }

      const idToken = response.data.idToken;
      const res = await googleLogin({ idToken });

      if (res.status !== 200) {
        return { success: false, error: "서버 로그인 실패" };
      }

      const body = res.data as any;
      const accessToken: string = body?.data?.accessToken;
      const expiresIn: number = body?.data?.expiresIn ?? 3600;

      if (!accessToken) {
        return { success: false, error: "토큰을 받지 못했습니다" };
      }

      const jwtPayload = decodeJwtPayload(accessToken);
      const role = jwtPayload?.role as UserType | undefined;

      if (role === "ROLE_GUEST") {
        await handleAuthSuccess(accessToken, expiresIn, "ROLE_GUEST");
        const userId = jwtPayload?.sub ? parseInt(jwtPayload.sub, 10) : undefined;
        return { success: true, needsSignup: true, userId };
      }

      await saveLoginProvider("google");
      await handleAuthSuccess(accessToken, expiresIn, role ?? "ROLE_CUSTOMER");
      return { success: true };
    } catch (error: any) {
      if (isErrorWithCode && isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            return { success: false, error: "cancelled" };
          case statusCodes.IN_PROGRESS:
            return { success: false, error: "로그인 진행 중입니다" };
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            return { success: false, error: "Play Services를 사용할 수 없습니다" };
        }
      }
      Sentry.captureException(error, { extra: { provider: "google" } });
      return {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      };
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  const logout = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error("구글 로그아웃 에러:", error);
    }
  }, []);

  return { login, logout, isLoading, isReady };
}