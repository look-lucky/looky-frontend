import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { clearToken, getCollegeId, getUsername, getUserType, isTokenValid, saveCollegeId, saveToken, UserType, getCredentials, clearCredentials } from "./token";
import { authEvents } from "./auth-events";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: UserType | null;
  collegeId: number | null;
  username: string | null;
}

interface AuthContextValue extends AuthState {
  handleAuthSuccess: (accessToken: string, expiresIn: number, userType: UserType) => Promise<void>;
  handleLogout: () => Promise<void>;
  saveUserCollegeId: (collegeId: number) => Promise<void>;
  // 개발용: 로그인 없이 userType 전환
  devSetUserType: (userType: UserType) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userType: null,
    collegeId: null,
    username: null,
  });

  // 앱 시작 시 토큰 확인
  useEffect(() => {
    (async () => {
      const valid = await isTokenValid();
      const userType = await getUserType();
      const collegeId = await getCollegeId();
      const username = await getUsername();
      setState({ isAuthenticated: valid, isLoading: false, userType, collegeId, username });
    })();
  }, []);

  // ✅ 이벤트 리스너: 토큰 리프레시 실패 → 자동 재로그인 시도 후 실패 시 로그아웃
  useEffect(() => {
    const handleRefreshFailed = async (payload: { reason?: string }) => {
      console.log("[AuthContext] Token refresh failed, trying auto-login...", payload);

      const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4010";
      const credentials = await getCredentials();

      if (credentials) {
        try {
          const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: credentials.username, password: credentials.password }),
            credentials: "include",
          });
          const body = await res.text();
          const data = JSON.parse(body);

          if (res.status === 200 && data.data?.accessToken) {
            const { accessToken, expiresIn } = data.data;
            let role: UserType = "ROLE_CUSTOMER";
            try {
              const payload = JSON.parse(atob(accessToken.split(".")[1]));
              if (payload?.role) role = payload.role as UserType;
            } catch {}

            await saveToken(accessToken, expiresIn ?? 3600, role);
            const collegeId = await getCollegeId();
            const username = await getUsername();
            setState({ isAuthenticated: true, isLoading: false, userType: role, collegeId, username });
            console.log("[AuthContext] Auto-login succeeded");
            return;
          }
        } catch (e) {
          console.log("[AuthContext] Auto-login failed:", e);
        }
      }

      // 자동 재로그인 실패 → 자격증명 삭제 후 로그아웃
      await clearToken();
      await clearCredentials();
      setState({
        isAuthenticated: false,
        isLoading: false,
        userType: null,
        collegeId: null,
        username: null,
      });

      router.replace("/landing");

      Alert.alert(
        "세션 만료",
        "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
        [{ text: "확인" }]
      );
    };

    authEvents.on("token-refresh-failed", handleRefreshFailed);

    return () => {
      authEvents.off("token-refresh-failed", handleRefreshFailed);
    };
  }, [router]);

  const handleAuthSuccess = useCallback(
    async (accessToken: string, expiresIn: number, userType: UserType) => {
      await saveToken(accessToken, expiresIn, userType);
      const collegeId = await getCollegeId();
      const username = await getUsername();
      setState({ isAuthenticated: true, isLoading: false, userType, collegeId, username });
    },
    []
  );

  const handleLogout = useCallback(async () => {
    await clearToken();
    await clearCredentials();
    setState({ isAuthenticated: false, isLoading: false, userType: null, collegeId: null, username: null });
  }, []);

  const saveUserCollegeId = useCallback(async (collegeId: number) => {
    await saveCollegeId(collegeId);
    setState((prev) => ({ ...prev, collegeId }));
  }, []);

  // 개발용: 로그인 없이 userType 전환 (테스트용)
  const devSetUserType = useCallback((userType: UserType) => {
    setState((prev) => ({ ...prev, isAuthenticated: true, isLoading: false, userType }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, handleAuthSuccess, handleLogout, saveUserCollegeId, devSetUserType }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
