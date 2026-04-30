import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from "expo-linking";
import * as Sentry from "@sentry/react-native";
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
    WebBrowser.warmUpAsync().catch(() => {});
    return () => {
      WebBrowser.coolDownAsync().catch(() => {
        // 브라우저가 이미 닫혀있을 때 발생하는 무해한 에러 — Sentry 전송 불필요
      });
    };
  }, []);

  const processCallbackUrl = useCallback(
    async (callbackUrl: string, provider: SocialProvider): Promise<SocialLoginResult> => {
      const url = new URL(callbackUrl);
      const params = new URLSearchParams(url.search);

      const error = params.get("error");
      if (error) {
        Sentry.withScope((scope) => {
          scope.setTag("feature", "social-login");
          scope.setTag("provider", provider);
          scope.setTag("step", "oauth-callback");
          scope.setContext("social_login", { error, callbackUrl });
          Sentry.captureMessage(`[소셜로그인] OAuth 콜백 에러 (${provider})`, "error");
        });
        return { success: false, error };
      }

      const needsSignup = params.get("needsSignup") === "true";
      const userId = params.get("userId");
      if (needsSignup && userId) {
        return {
          success: true,
          needsSignup: true,
          userId: parseInt(userId, 10),
        };
      }

      const accessToken = params.get("accessToken");
      const expiresIn = params.get("expiresIn");

      if (accessToken) {
        const jwtPayload = decodeJwtPayload(accessToken);
        const role = jwtPayload?.role;

        if (role === "ROLE_GUEST") {
          await handleAuthSuccess(
            accessToken,
            expiresIn ? parseInt(expiresIn, 10) : 3600,
            "ROLE_GUEST",
          );
          await saveLoginProvider(provider);
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

        const authUrl = `${BASE_URL}/oauth2/authorization/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`;

        // Android: openAuthSessionAsync가 dismiss를 반환할 때 URL을 Linking으로 수신
        let receivedCallbackUrl: string | null = null;
        let linkingResolve: ((url: string) => void) | null = null;
        const linkingPromise = new Promise<string>((resolve) => {
          linkingResolve = resolve;
        });
        const subscription = Linking.addEventListener("url", ({ url }) => {
          if (url.startsWith(redirectUri)) {
            receivedCallbackUrl = url;
            linkingResolve?.(url);
          }
        });

        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUri,
        );

        let callbackUrl: string | null = null;

        if (result.type === "success" && result.url) {
          callbackUrl = result.url;
          subscription.remove();
        } else if (result.type === "dismiss") {
          callbackUrl = receivedCallbackUrl ?? await Promise.race([
            linkingPromise,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
          ]);
          subscription.remove();
          if (!callbackUrl) {
            return { success: false, error: "cancelled" };
          }
        } else {
          subscription.remove();
          if (result.type === "cancel") {
            return { success: false, error: "cancelled" };
          }
          return { success: false, error: "로그인 실패" };
        }

        return processCallbackUrl(callbackUrl, provider);
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setTag("feature", "social-login");
          scope.setTag("provider", provider);
          scope.setTag("step", "oauth-browser");
          scope.setContext("social_login", { provider, redirectUri });
          Sentry.captureException(error);
        });
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

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("identityToken을 받지 못했습니다.");
      }

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
        Sentry.withScope((scope) => {
          scope.setTag("feature", "social-login");
          scope.setTag("provider", "apple");
          scope.setTag("step", "backend-login");
          scope.setContext("social_login", { httpStatus: response.status, errorText });
          Sentry.captureMessage(`[소셜로그인] Apple 백엔드 인증 실패 (${response.status})`, "error");
        });
        return { success: false, error: "서버 로그인 실패" };
      }

      const data = await response.json();

      if (data.isSuccess && data.data.accessToken) {
        const accessToken = data.data.accessToken;
        const expiresIn = data.data.expiresIn || 3600;
        const jwtPayload = decodeJwtPayload(accessToken);
        const role = jwtPayload?.role;

        if (role === "ROLE_GUEST") {
          await handleAuthSuccess(accessToken, expiresIn, "ROLE_GUEST");
          await saveLoginProvider("apple");
          const subValue = jwtPayload?.sub;
          const userId = subValue ? parseInt(subValue, 10) : null;

          if (!userId) {
            Sentry.withScope((scope) => {
              scope.setTag("feature", "social-login");
              scope.setTag("provider", "apple");
              scope.setTag("step", "jwt-parse");
              scope.setContext("social_login", { sub: subValue });
              Sentry.captureMessage("[소셜로그인] Apple userId 파싱 실패", "error");
            });
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
        return { success: false, error: "cancelled" };
      }
      Sentry.withScope((scope) => {
        scope.setTag("feature", "social-login");
        scope.setTag("provider", "apple");
        scope.setTag("step", "apple-auth");
        scope.setContext("social_login", { errorCode: error.code });
        Sentry.captureException(error);
      });
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
