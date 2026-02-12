import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "./auth-context";
import type { UserType } from "./token";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4010";

export type SocialProvider = "google" | "kakao" | "apple";

interface SocialLoginResult {
  success: boolean;
  needsSignup?: boolean;
  userId?: number;
  error?: string;
}

// JWT payload 디코딩
function decodeJwtPayload(token: string): { role?: string; sub?: string } | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function useSocialLogin() {
  const { handleAuthSuccess } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

  // 딥링크 콜백 URL
  const redirectUri = Linking.createURL("auth/callback");

  useEffect(() => {
    // 브라우저 세션 정리
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  console.log("Redirect URI:", redirectUri);

  const login = useCallback(
    async (provider: SocialProvider): Promise<SocialLoginResult> => {
      try {
        setIsLoading(true);
        setLoadingProvider(provider);

        const authUrl = `${BASE_URL}/oauth2/authorization/${provider}`;

        console.log(`=== ${provider} 소셜 로그인 시작 ===`);
        console.log("Auth URL:", authUrl);
        console.log("Redirect URI:", redirectUri);

        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUri,
        );

        console.log("Browser result:", result);

        if (result.type === "success" && result.url) {
          const url = new URL(result.url);
          const params = new URLSearchParams(url.search);

          // 에러 체크
          const error = params.get("error");
          if (error) {
            console.error("OAuth error:", error);
            return { success: false, error };
          }

          // 신규 회원 (추가 정보 필요)
          const needsSignup = params.get("needsSignup") === "true";
          const userId = params.get("userId");
          if (needsSignup && userId) {
            console.log("신규 회원 - 추가 정보 입력 필요");
            return {
              success: true,
              needsSignup: true,
              userId: parseInt(userId, 10),
            };
          }

          // 토큰 수신
          const accessToken = params.get("accessToken");
          const expiresIn = params.get("expiresIn");

          if (accessToken) {
            const jwtPayload = decodeJwtPayload(accessToken);
            const role = jwtPayload?.role;

            // 신규 소셜 유저 - ROLE_GUEST로 반환되면 추가 정보 입력 필요
            if (role === "ROLE_GUEST") {
              console.log("신규 소셜 회원 - 추가 정보 입력 필요");
              // API 호출(단과대학/학과 조회 등)을 위해 임시 토큰 저장
              await handleAuthSuccess(
                accessToken,
                expiresIn ? parseInt(expiresIn, 10) : 3600,
                "ROLE_GUEST",
              );
              const userId = jwtPayload?.sub ? parseInt(jwtPayload.sub, 10) : null;
              return {
                success: true,
                needsSignup: true,
                userId: userId ?? undefined,
              };
            }

            console.log("로그인 성공 - 토큰 수신");
            await handleAuthSuccess(
              accessToken,
              expiresIn ? parseInt(expiresIn, 10) : 3600,
              (role as UserType) ?? "ROLE_GUEST",
            );

            return { success: true };
          }

          return { success: false, error: "토큰을 받지 못했습니다" };
        }

        if (result.type === "cancel") {
          console.log("사용자가 로그인을 취소했습니다");
          return { success: false, error: "cancelled" };
        }

        return { success: false, error: "로그인 실패" };
      } catch (error) {
        console.error(`${provider} 로그인 에러:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "알 수 없는 오류",
        };
      } finally {
        setIsLoading(false);
        setLoadingProvider(null);
      }
    },
    [redirectUri, handleAuthSuccess],
  );

  const loginWithGoogle = useCallback(() => login("google"), [login]);
  const loginWithKakao = useCallback(() => login("kakao"), [login]);
  const loginWithApple = useCallback(() => login("apple"), [login]);

  return {
    login,
    loginWithGoogle,
    loginWithKakao,
    loginWithApple,
    isLoading,
    loadingProvider,
    redirectUri,
  };
}
