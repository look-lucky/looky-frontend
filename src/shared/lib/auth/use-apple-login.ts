import { useCallback } from "react";
import { useSocialLogin } from "./use-social-login";

export function useAppleLogin() {
    const { loginWithApple, isLoading } = useSocialLogin();

    const login = useCallback(async () => {
        return await loginWithApple();
    }, [loginWithApple]);

    return { login, isLoading };
}
