// src/api/mutator.ts
import { getToken } from "@/src/shared/lib/auth/token";

// ----------------------------------------------------------------------
// [서버 주소 설정]
// ----------------------------------------------------------------------
const PROD_URL = "https://api.looky.kr";      // 운영 서버
const DEV_URL = "https://dev-api.looky.kr";   // 개발 서버

const BASE_URL = PROD_URL; 
// const BASE_URL = DEV_URL; // 나중에 개발 서버 쓸 땐 위를 주석


// 인증 불필요한 엔드포인트
const PUBLIC_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/auth/check-username",
];

export async function customFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const fullUrl = url.startsWith("http") ? url : `${cleanBaseUrl}${url}`;

  console.log(`[API 요청] ${fullUrl}`);

  // 인증 필요한 요청이면 토큰 주입
  const isPublic = PUBLIC_ENDPOINTS.some((ep) => url.startsWith(ep));
  const headers = new Headers(options.headers);

  // JSON 통신을 위한 기본 헤더 추가
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!isPublic) {
    const tokenData = await getToken();
    if (tokenData?.accessToken) {
      headers.set("Authorization", `Bearer ${tokenData.accessToken}`);
    }
  }

  try {
    const res = await fetch(fullUrl, { ...options, headers });

    // 응답 본문 처리
    const body = [204, 205, 304].includes(res.status) ? null : await res.text();
    const data = body ? JSON.parse(body) : {};

    // 에러 응답일 경우 throw
    if (!res.ok) {
      console.error('[API 에러]', res.status, data);
      throw { status: res.status, data, headers: res.headers };
    }

    return { data, status: res.status, headers: res.headers } as T;

  } catch (error) {
    console.error('[네트워크/로직 에러]', error);
    throw error;
  }
}