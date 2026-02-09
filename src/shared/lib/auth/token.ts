import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "auth_access_token";
const EXPIRES_AT_KEY = "auth_expires_at";
const USER_TYPE_KEY = "auth_user_type";
const COLLEGE_ID_KEY = "user_college_id";
const USERNAME_KEY = "auth_username";

export interface TokenData {
  accessToken: string;
  expiresAt: number; // timestamp
}

export type UserType = "ROLE_GUEST" | "ROLE_CUSTOMER" | "ROLE_OWNER" | "ROLE_ADMIN";

export async function saveToken(
  accessToken: string,
  expiresIn: number,
  userType: UserType,
): Promise<void> {
  const expiresAt = Date.now() + expiresIn * 1000;
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [EXPIRES_AT_KEY, expiresAt.toString()],
    [USER_TYPE_KEY, userType],
  ]);
}

export async function getToken(): Promise<TokenData | null> {
  const [[, accessToken], [, expiresAt]] = await AsyncStorage.multiGet([
    ACCESS_TOKEN_KEY,
    EXPIRES_AT_KEY,
  ]);

  if (!accessToken || !expiresAt) {
    return null;
  }

  return {
    accessToken,
    expiresAt: parseInt(expiresAt, 10),
  };
}

export async function getUserType(): Promise<UserType | null> {
  return (await AsyncStorage.getItem(USER_TYPE_KEY)) as UserType | null;
}

export async function saveCollegeId(collegeId: number): Promise<void> {
  await AsyncStorage.setItem(COLLEGE_ID_KEY, collegeId.toString());
}

export async function getCollegeId(): Promise<number | null> {
  const value = await AsyncStorage.getItem(COLLEGE_ID_KEY);
  return value ? parseInt(value, 10) : null;
}

export async function saveUsername(username: string): Promise<void> {
  await AsyncStorage.setItem(USERNAME_KEY, username);
}

export async function getUsername(): Promise<string | null> {
  return await AsyncStorage.getItem(USERNAME_KEY);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.multiRemove([
    ACCESS_TOKEN_KEY,
    EXPIRES_AT_KEY,
    USER_TYPE_KEY,
    COLLEGE_ID_KEY,
    USERNAME_KEY,
  ]);
}

export async function isTokenValid(): Promise<boolean> {
  const token = await getToken();
  if (!token) return false;
  // 만료 1분 전부터 invalid 처리 (refresh 여유)
  return token.expiresAt > Date.now() + 60 * 1000;
}

export function decodeJwtPayload(token: string): { role?: string; sub?: string } | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

/**
 * 토큰이 곧 만료될 예정인지 체크 (Proactive Refresh용)
 * @param bufferMinutes 만료 몇 분 전부터 true 반환 (기본값: 2분)
 */
export async function isTokenExpiringSoon(bufferMinutes: number = 2): Promise<boolean> {
  const token = await getToken();
  if (!token) return false;

  const now = Date.now();
  const bufferMs = bufferMinutes * 60 * 1000;

  return now + bufferMs >= token.expiresAt;
}
