import Constants, { ExecutionEnvironment } from "expo-constants";
import { useCallback, useState } from "react";
import * as Sentry from "@sentry/react-native";

import { kakaoLogin } from "@/src/api/auth";
import { useAuth } from "./auth-context";
import type { UserType } from "./token";
import { saveLoginProvider } from "./token";

// Expo Go 여부 체크
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// 네이티브 모듈 안전 로드
let KakaoLogin: any;

if (!isExpoGo) {
  try {
    KakaoLogin = require("@react-native-seoul/kakao-login");
  } catch (e) {
    console.warn("KakaoLogin module load failed", e);
  }
}

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

export function useKakaoLogin() {
  const { handleAuthSuccess } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (): Promise<SocialLoginResult> => {
    try {
      setIsLoading(true);

      if (isExpoGo || !KakaoLogin) {
        return { success: false, error: "Expo Go에서는 카카오 로그인을 지원하지 않습니다. 빌드된 앱에서 확인해주세요." };
      }

      const result = await KakaoLogin.login();
      const res = await kakaoLogin({
        accessToken: result.accessToken,
        idToken: result.idToken ?? undefined,
      });

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

      await saveLoginProvider("kakao");
      await handleAuthSuccess(accessToken, expiresIn, role ?? "ROLE_CUSTOMER");
      return { success: true };
    } catch (error: any) {
      if (error.code === "E_CANCELLED_OPERATION") {
        return { success: false, error: "cancelled" };
      }
      Sentry.captureException(error, { extra: { provider: "kakao" } });
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
      await KakaoLogin.logout();
    } catch (error) {
      console.error("카카오 로그아웃 에러:", error);
    }
  }, []);

  return { login, logout, isLoading, isReady: true };
}
