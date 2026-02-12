// src/api/mutator.ts
import {
  getToken,
  saveToken,
  clearToken,
  getUserType,
  isTokenExpiringSoon,
} from "@/src/shared/lib/auth/token";
import { authEvents } from "@/src/shared/lib/auth/auth-events";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4010";

// 인증 불필요한 엔드포인트
const PUBLIC_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/auth/check-username",
  "/api/auth/email",
  "/api/auth/find-",
  "/api/auth/complete-social-signup",
  "/api/universities",
  "/api/organizations",
];

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (res.status === 200) {
      const body = await res.text();
      const data = JSON.parse(body);

      if (data.data?.accessToken && data.data?.expiresIn) {
        const userType = await getUserType();
        await saveToken(data.data.accessToken, data.data.expiresIn, userType || "ROLE_CUSTOMER");

        // 이벤트 발행: 리프레시 성공
        authEvents.emit("token-refresh-success", {
          accessToken: data.data.accessToken,
          expiresIn: data.data.expiresIn,
        });

        return true;
      }
    }

    // 리프레시 실패 → 이벤트 발행
    await clearToken();
    authEvents.emit("token-refresh-failed", {
      reason: `HTTP ${res.status}`,
    });
    return false;
  } catch (error) {
    console.error("[Token Refresh] Failed:", error);
    await clearToken();

    // 에러 발생 시에도 이벤트 발행
    authEvents.emit("token-refresh-failed", {
      reason: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}

export async function customFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  const isPublic = PUBLIC_ENDPOINTS.some((ep) => url.startsWith(ep));
  const headers = new Headers(options.headers);

  // FormData일 경우 Content-Type을 명시적으로 삭제하여 fetch가 multipart/form-data boundary를 자동 설정하도록 함
  if (options.body instanceof FormData) {
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // ✅ Proactive Refresh: 인증 필요한 엔드포인트이고, 토큰이 곧 만료될 예정이면 사전 갱신
  if (!isPublic && !url.includes("/refresh")) {
    const expiring = await isTokenExpiringSoon(2); // 2분 내 만료?

    if (expiring) {
      console.log("[Proactive Refresh] Token expiring soon, refreshing...");
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const refreshSuccess = await refreshPromise;

      if (!refreshSuccess) {
        console.log("[Proactive Refresh] Failed, proceeding with request anyway");
      }
    }
  }

  if (!isPublic) {
    const tokenData = await getToken();
    if (tokenData?.accessToken) {
      headers.set("Authorization", `Bearer ${tokenData.accessToken}`);
    }
  }

  try {
    let res = await fetch(fullUrl, { ...options, headers });

    // 401 Unauthorized → 토큰 리프레시 시도 (public 엔드포인트도 서버가 인증 요구할 수 있으므로 시도)
    if (res.status === 401 && !url.includes("/refresh")) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const refreshSuccess = await refreshPromise;

      if (refreshSuccess) {
        const newTokenData = await getToken();
        if (newTokenData?.accessToken) {
          headers.set("Authorization", `Bearer ${newTokenData.accessToken}`);
          res = await fetch(fullUrl, { ...options, headers });
        }
      }
    }

    const body = [204, 205, 304].includes(res.status) ? null : await res.text();

    let data: any = {};
    if (body) {
      try {
        data = JSON.parse(body);
      } catch {
        throw new Error(
          `서버 응답 파싱 실패 (status: ${res.status}, url: ${url}): ${body.substring(0, 200)}`,
        );
      }
    }

    if (!res.ok) {
      console.error(`[API 에러] ${res.status}`, data);
      throw { status: res.status, data, headers: res.headers };
    }

    return { data, status: res.status, headers: res.headers } as T;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log("[Network] Request cancelled (AbortError)");
    } else {
      console.error("[네트워크/로직 에러]", error);
    }
    throw error;
  }
}
