// src/api/mutator.ts
import { getToken, saveToken, clearToken, getUserType } from "@/src/shared/lib/auth/token";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4010";

// 인증 불필요한 엔드포인트
const PUBLIC_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/auth/check-username",
];

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

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
        return true;
      }
    }

    await clearToken();
    return false;
  } catch (error) {
    console.error("[Token Refresh] Failed:", error);
    await clearToken();
    return false;
  }
}

export async function customFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  // 인증 필요한 요청이면 토큰 주입
  const isPublic = PUBLIC_ENDPOINTS.some((ep) => url.startsWith(ep));
  const headers = new Headers(options.headers);

  if (!isPublic) {
    const tokenData = await getToken();
    if (tokenData?.accessToken) {
      headers.set("Authorization", `Bearer ${tokenData.accessToken}`);
    }
  }

  let res = await fetch(fullUrl, { ...options, headers });

  // 401 Unauthorized → 토큰 리프레시 시도
  if (res.status === 401 && !isPublic && !url.includes("/refresh")) {
    if (!isRefreshing) {
      isRefreshing = true;

      const refreshSuccess = await refreshAccessToken();
      isRefreshing = false;

      // 대기 중인 요청들 처리
      refreshQueue.forEach((callback) => callback());
      refreshQueue = [];

      if (refreshSuccess) {
        // 새 토큰으로 재시도
        const newTokenData = await getToken();
        if (newTokenData?.accessToken) {
          headers.set("Authorization", `Bearer ${newTokenData.accessToken}`);
          res = await fetch(fullUrl, { ...options, headers });
        }
      }
    } else {
      // 리프레시 중이면 대기
      await new Promise<void>((resolve) => {
        refreshQueue.push(resolve);
      });

      // 리프레시 완료 후 재시도
      const newTokenData = await getToken();
      if (newTokenData?.accessToken) {
        headers.set("Authorization", `Bearer ${newTokenData.accessToken}`);
        res = await fetch(fullUrl, { ...options, headers });
      }
    }
  }

  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  let data = {};
  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      throw new Error(
        `서버 응답 파싱 실패 (status: ${res.status}, url: ${url}): ${body.substring(0, 200)}`,
      );
    }
  }

  return { data, status: res.status, headers: res.headers } as T;
}
