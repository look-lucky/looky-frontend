import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { clearToken, getToken, isTokenValid, saveToken } from "./token";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  handleAuthSuccess: (accessToken: string, expiresIn: number) => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  // 앱 시작 시 토큰 확인
  useEffect(() => {
    (async () => {
      const valid = await isTokenValid();
      setState({ isAuthenticated: valid, isLoading: false });
    })();
  }, []);

  const handleAuthSuccess = useCallback(
    async (accessToken: string, expiresIn: number) => {
      await saveToken(accessToken, expiresIn);
      setState({ isAuthenticated: true, isLoading: false });
    },
    []
  );

  const handleLogout = useCallback(async () => {
    await clearToken();
    setState({ isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, handleAuthSuccess, handleLogout }}
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
