import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { clearToken, getCollegeId, getCollegeName, getUsername, getUserType, isTokenValid, saveCollegeId, saveCollegeName, saveToken, UserType, getCredentials, clearCredentials, getLoginProvider, LoginProvider } from "./token";
import { authEvents } from "./auth-events";
import { setLoggingOut } from "@/src/api/mutator";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: UserType | null;
  collegeId: number | null;
  collegeName: string | null;
  username: string | null;
  loginProvider: LoginProvider | null;
}

interface AuthContextValue extends AuthState {
  handleAuthSuccess: (accessToken: string, expiresIn: number, userType: UserType) => Promise<void>;
  handleLogout: () => Promise<void>;
  saveUserCollegeId: (collegeId: number) => Promise<void>;
  saveUserCollegeName: (collegeName: string) => Promise<void>;
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
    collegeName: null,
    username: null,
    loginProvider: null,
  });
  const isAuthenticatedRef = useRef(false);

  // 앱 시작 시 토큰 확인
  useEffect(() => {
    (async () => {
      const valid = await isTokenValid();
      const userType = await getUserType();
      const collegeId = await getCollegeId();
      const collegeName = await getCollegeName();
      const username = await getUsername();
      const loginProvider = await getLoginProvider();
      isAuthenticatedRef.current = valid;
      setState({ isAuthenticated: valid, isLoading: false, userType, collegeId, collegeName, username, loginProvider });
    })();
  }, []);

  // ✅ 이벤트 리스너: 토큰 리프레시 실패 → 자동 재로그인 시도 후 실패 시 로그아웃
  useEffect(() => {
    const handleRefreshFailed = async (payload: { reason?: string }) => {
      // 이미 로그아웃 처리 중이면 무시 (로그아웃 후 남은 API 요청의 401 때문에 세션 만료 Alert이 뜨는 것 방지)
      if (!isAuthenticatedRef.current) return;

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
            const collegeName = await getCollegeName();
            const username = await getUsername();
            const loginProvider = await getLoginProvider();
            setState({ isAuthenticated: true, isLoading: false, userType: role, collegeId, collegeName, username, loginProvider });
            console.log("[AuthContext] Auto-login succeeded");
            return;
          }
        } catch (e) {
          console.log("[AuthContext] Auto-login failed:", e);
        }
      }

      // 자동 재로그인 실패 → 자격증명 삭제 후 로그아웃
      isAuthenticatedRef.current = false;
      await clearToken();
      await clearCredentials();
      setState({
        isAuthenticated: false,
        isLoading: false,
        userType: null,
        collegeId: null,
        collegeName: null,
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
      const collegeName = await getCollegeName();
      const username = await getUsername();
      const loginProvider = await getLoginProvider();
      isAuthenticatedRef.current = true;
      setState({ isAuthenticated: true, isLoading: false, userType, collegeId, collegeName, username, loginProvider });
    },
    []
  );

  const handleLogout = useCallback(async () => {
    isAuthenticatedRef.current = false;
    setLoggingOut(true);
    await clearToken();
    await clearCredentials();
    setState({ isAuthenticated: false, isLoading: false, userType: null, collegeId: null, collegeName: null, username: null, loginProvider: null });
    setLoggingOut(false);
  }, []);

  const saveUserCollegeId = useCallback(async (collegeId: number) => {
    await saveCollegeId(collegeId);
    setState((prev) => ({ ...prev, collegeId }));
  }, []);

  const saveUserCollegeName = useCallback(async (collegeName: string) => {
    await saveCollegeName(collegeName);
    setState((prev) => ({ ...prev, collegeName }));
  }, []);

  // 개발용: 로그인 없이 userType 전환 (테스트용)
  const devSetUserType = useCallback((userType: UserType) => {
    setState((prev) => ({ ...prev, isAuthenticated: true, isLoading: false, userType }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, handleAuthSuccess, handleLogout, saveUserCollegeId, saveUserCollegeName, devSetUserType }}
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
