import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "auth_access_token";
const EXPIRES_AT_KEY = "auth_expires_at";

export interface TokenData {
  accessToken: string;
  expiresAt: number; // timestamp
}

export async function saveToken(
  accessToken: string,
  expiresIn: number
): Promise<void> {
  const expiresAt = Date.now() + expiresIn * 1000;
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [EXPIRES_AT_KEY, expiresAt.toString()],
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

export async function clearToken(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, EXPIRES_AT_KEY]);
}

export async function isTokenValid(): Promise<boolean> {
  const token = await getToken();
  if (!token) return false;
  // 만료 1분 전부터 invalid 처리 (refresh 여유)
  return token.expiresAt > Date.now() + 60 * 1000;
}
