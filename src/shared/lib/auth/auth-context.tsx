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
import { clearToken, getCollegeId, getUserType, isTokenValid, saveCollegeId, saveToken, UserType } from "./token";
import { authEvents } from "./auth-events";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: UserType | null;
  collegeId: number | null;
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
  });

  // 앱 시작 시 토큰 확인
  useEffect(() => {
    (async () => {
      const valid = await isTokenValid();
      const userType = await getUserType();
      const collegeId = await getCollegeId();
      setState({ isAuthenticated: valid, isLoading: false, userType, collegeId });
    })();
  }, []);

  // ✅ 이벤트 리스너: 토큰 리프레시 실패 → 자동 로그아웃
  useEffect(() => {
    const handleRefreshFailed = async (payload: { reason?: string }) => {
      console.log("[AuthContext] Token refresh failed, logging out...", payload);

      await clearToken();
      setState({
        isAuthenticated: false,
        isLoading: false,
        userType: null,
        collegeId: null,
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
      setState({ isAuthenticated: true, isLoading: false, userType, collegeId });
    },
    []
  );

  const handleLogout = useCallback(async () => {
    await clearToken();
    setState({ isAuthenticated: false, isLoading: false, userType: null, collegeId: null });
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
