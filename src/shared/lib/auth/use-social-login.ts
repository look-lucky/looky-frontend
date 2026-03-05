import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "./auth-context";
import { saveLoginProvider, type UserType } from "./token";

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
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch (e) {
    console.error("JWT Decode Error:", e);
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

  const processCallbackUrl = useCallback(
    async (callbackUrl: string, provider: SocialProvider): Promise<SocialLoginResult> => {
      const url = new URL(callbackUrl);
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
          if (!userId) {
            return {
              success: false,
              error: "사용자 정보를 가져올 수 없습니다. (ID 누락)",
            };
          }
          return {
            success: true,
            needsSignup: true,
            userId: userId,
          };
        }

        console.log("로그인 성공 - 토큰 수신");
        await saveLoginProvider(provider);
        await handleAuthSuccess(
          accessToken,
          expiresIn ? parseInt(expiresIn, 10) : 3600,
          (role as UserType) ?? "ROLE_GUEST",
        );

        return { success: true };
      }

      return { success: false, error: "토큰을 받지 못했습니다" };
    },
    [handleAuthSuccess],
  );

  const login = useCallback(
    async (provider: SocialProvider): Promise<SocialLoginResult> => {
      try {
        setIsLoading(true);
        setLoadingProvider(provider);

        // 백엔드에 redirect_uri 전달 (Spring Security OAuth2 success handler에서 사용)
        const authUrl = `${BASE_URL}/oauth2/authorization/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`;

        console.log(`=== ${provider} 소셜 로그인 시작 ===`);
        console.log("Auth URL:", authUrl);
        console.log("Redirect URI:", redirectUri);

        // Android: openAuthSessionAsync가 dismiss를 반환할 때 URL을 Linking으로 수신
        let receivedCallbackUrl: string | null = null;
        let linkingResolve: ((url: string) => void) | null = null;
        const linkingPromise = new Promise<string>((resolve) => {
          linkingResolve = resolve;
        });
        const subscription = Linking.addEventListener("url", ({ url }) => {
          console.log("[Linking] URL received:", url);
          console.log("[Linking] redirectUri:", redirectUri);
          console.log("[Linking] matches:", url.startsWith(redirectUri));
          if (url.startsWith(redirectUri)) {
            receivedCallbackUrl = url;
            linkingResolve?.(url);
          }
        });

        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUri,
        );

        console.log("Browser result:", result);

        let callbackUrl: string | null = null;

        if (result.type === "success" && result.url) {
          callbackUrl = result.url;
          subscription.remove();
        } else if (result.type === "dismiss") {
          // Android에서 딥링크로 콜백이 오는 경우 짧게 대기
          callbackUrl = receivedCallbackUrl ?? await Promise.race([
            linkingPromise,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
          ]);
          subscription.remove();
          if (!callbackUrl) {
            console.log("dismiss - 콜백 URL 없음 (사용자 취소)");
            return { success: false, error: "cancelled" };
          }
        } else {
          subscription.remove();
          if (result.type === "cancel") {
            console.log("사용자가 로그인을 취소했습니다");
            return { success: false, error: "cancelled" };
          }
          return { success: false, error: "로그인 실패" };
        }

        return processCallbackUrl(callbackUrl, provider);
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
    [redirectUri, processCallbackUrl],
  );

  const loginWithGoogle = useCallback(() => login("google"), [login]);
  const loginWithKakao = useCallback(() => login("kakao"), [login]);
  const loginWithApple = useCallback(async (): Promise<SocialLoginResult> => {
    try {
      setIsLoading(true);
      setLoadingProvider("apple");

      console.log("=== Apple 소셜 로그인(Native) 시작 ===");

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log("Apple Credential 수신 성공");

      if (!credential.identityToken) {
        throw new Error("identityToken을 받지 못했습니다.");
      }

      // 백엔드로 토큰 전송 (POST /api/auth/apple/login)
      const fullName = credential.fullName
        ? `${credential.fullName.familyName || ""}${credential.fullName.givenName || ""}`
        : null;

      const response = await fetch(`${BASE_URL}/api/auth/apple/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: credential.identityToken,
          name: fullName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Apple Backend 로그인 실패:", errorText);
        return { success: false, error: "서버 로그인 실패" };
      }

      const data = await response.json();
      console.log("Apple Backend 응답(Raw):", JSON.stringify(data, null, 2));

      if (data.isSuccess && data.data.accessToken) {
        const accessToken = data.data.accessToken;
        const expiresIn = data.data.expiresIn || 3600;
        const jwtPayload = decodeJwtPayload(accessToken);
        const role = jwtPayload?.role;

        console.log("디코딩된 JWT Payload:", JSON.stringify(jwtPayload, null, 2));
        console.log("추출된 Role:", role);
        console.log("추출된 sub(UserId):", jwtPayload?.sub);

        if (role === "ROLE_GUEST") {
          console.log("신규 소셜 회원 - 추가 정보 입력 필요");
          await handleAuthSuccess(accessToken, expiresIn, "ROLE_GUEST");
          const subValue = jwtPayload?.sub;
          const userId = subValue ? parseInt(subValue, 10) : null;

          if (!userId) {
            console.error("UserId 파싱 실패. subValue:", subValue);
            return {
              success: false,
              error: `사용자 정보를 가져올 수 없습니다. (ID: ${subValue})`,
            };
          }
          return {
            success: true,
            needsSignup: true,
            userId: userId,
          };
        }

        console.log("로그인 성공 - 토큰 수신");
        await saveLoginProvider("apple");
        await handleAuthSuccess(
          accessToken,
          expiresIn,
          (role as UserType) ?? "ROLE_GUEST",
        );

        return { success: true };
      }

      return {
        success: false,
        error: data.message || "로그인 처리 중 오류가 발생했습니다.",
      };
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        console.log("Apple Login cancelled by user");
        return { success: false, error: "cancelled" };
      }
      console.error("Apple 로그인 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      };
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  }, [handleAuthSuccess]);

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
