import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useCallback, useEffect, useState } from "react";

import { googleLogin } from "@/src/api/auth";
import { ENV } from "@/src/shared/constants/env";
import { useAuth } from "./auth-context";
import { saveLoginProvider } from "./token";
import type { UserType } from "./token";

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

export function useGoogleLogin() {
  const { handleAuthSuccess } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    });
    setIsReady(true);
  }, []);

  const login = useCallback(async (): Promise<SocialLoginResult> => {
    try {
      setIsLoading(true);

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
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
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            return { success: false, error: "cancelled" };
          case statusCodes.IN_PROGRESS:
            return { success: false, error: "로그인 진행 중입니다" };
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            return { success: false, error: "Play Services를 사용할 수 없습니다" };
        }
      }
      console.error("구글 로그인 에러:", error);
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
