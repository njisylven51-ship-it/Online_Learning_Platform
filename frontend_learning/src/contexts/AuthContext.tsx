import { 
  createContext, 
  useCallback, 
  useContext, 
  useEffect, 
  useMemo, 
  type ReactNode } 
from 'react';
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser';
import { useLogin } from '../features/auth/hooks/useLogin';
import { useLogout } from '../features/auth/hooks/useLogout';
import type { AuthUser, UserRole } from '../types/user';


export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isApprovedTeacher: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, error, refetch } = useCurrentUser();
  const { login: doLogin, loading: loginLoading, error: loginError } = useLogin({
    onSuccess: refetch,
  });
  const { logout: doLogout, loading: logoutLoading } = useLogout({
    onSuccess: refetch,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      await doLogin(email, password);
    },
    [doLogin],
  );
    // Global 401 handler — see client.ts.
  useEffect(() => {
    const onUnauthorized = () => {
      void refetch();
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [refetch]);
  

  const logout = useCallback(async () => {
    await doLogout();
  }, [doLogout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading: loading || loginLoading || logoutLoading,
      error: error ?? loginError,
      isAuthenticated: user !== null,
      role: user?.role ?? null,
      isApprovedTeacher:
        user?.role === 'teacher' && user.instructor_status === 'approved',
      login,
      logout,
    }),
    [user, loading, loginLoading, logoutLoading, error, loginError, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
