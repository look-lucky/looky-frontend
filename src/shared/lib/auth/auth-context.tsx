import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { clearToken, getCollegeId, getUserType, isTokenValid, saveCollegeId, saveToken, UserType } from "./token";

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
