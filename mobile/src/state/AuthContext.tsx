import { AxiosError } from 'axios';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { apiClient, onForceLogout } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { parseAuthTokens, parseUser, type UserDto } from '@/models/api';
import { authStorage } from '@/services/authStorage';

/**
 * Authentication state + actions.
 *
 * Ported from the Flutter `AuthProvider`. Backed by the axios client for
 * network and authStorage for token persistence.
 */
interface AuthContextValue {
  user: UserDto | null;
  loading: boolean;
  error: string | null;
  /** True once the initial token check has completed. */
  initialized: boolean;
  /** True when an access token exists in secure storage. */
  hasToken: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
  refresh: () => Promise<boolean>;
  loadMe: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  requestWaOtp: (phone: string) => Promise<boolean>;
  verifyWaOtp: (phone: string, code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function messageFor(err: unknown): string {
  if (err instanceof AxiosError) {
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string') return detail;
    if (err.code === 'ECONNABORTED') {
      return 'Connection timed out. Check your network and try again.';
    }
    if (err.response?.status === 401) return 'Invalid email or password.';
    if (!err.response) return 'Cannot reach the server. Check your connection.';
  }
  return 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const persistTokens = useCallback(async (data: unknown) => {
    const { accessToken, refreshToken } = parseAuthTokens(data);
    if (accessToken && refreshToken) {
      await authStorage.saveTokens(accessToken, refreshToken);
    }
  }, []);

  const run = useCallback(
    async (action: () => Promise<boolean>): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        return await action();
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const login = useCallback(
    (email: string, password: string) =>
      run(async () => {
        const res = await apiClient.post(endpoints.login, {
          email: email.trim(),
          password,
        });
        await persistTokens(res.data);
        if (res.data?.user) setUser(parseUser(res.data.user));
        return true;
      }),
    [run, persistTokens],
  );

  const register = useCallback(
    (fullName: string, email: string, password: string) =>
      run(async () => {
        // On 201 the backend returns `{message}` only — do NOT auto-login.
        await apiClient.post(endpoints.register, {
          full_name: fullName.trim(),
          email: email.trim(),
          password,
        });
        return true;
      }),
    [run],
  );

  const requestWaOtp = useCallback(
    (phone: string) =>
      run(async () => {
        await apiClient.post(endpoints.waRequestOtp, { phone: phone.trim() });
        return true;
      }),
    [run],
  );

  const verifyWaOtp = useCallback(
    (phone: string, code: string) =>
      run(async () => {
        const res = await apiClient.post(endpoints.waVerifyOtp, {
          phone: phone.trim(),
          code: code.trim(),
        });
        await persistTokens(res.data);
        if (res.data?.user) setUser(parseUser(res.data.user));
        return true;
      }),
    [run, persistTokens],
  );

  const refresh = useCallback(async (): Promise<boolean> => {
    const refreshToken = await authStorage.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await apiClient.post(endpoints.refresh, {
        refresh_token: refreshToken,
      });
      await persistTokens(res.data);
      return true;
    } catch {
      return false;
    }
  }, [persistTokens]);

  const loadMe = useCallback(async () => {
    try {
      const res = await apiClient.get(endpoints.me);
      setUser(parseUser(res.data));
    } catch {
      // Leave user as-is; the client interceptor handles 401 / refresh.
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post(endpoints.logout);
    } catch {
      // Ignore network failure — local logout must always succeed.
    }
    await authStorage.clearTokens();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const hasToken = useCallback(() => authStorage.hasToken(), []);

  // Force-logout when the api client gives up on refreshing.
  useEffect(() => {
    const unsub = onForceLogout(() => {
      setUser(null);
    });
    return unsub;
  }, []);

  // Initial token check + user hydration on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      if (await authStorage.hasToken()) {
        await loadMe();
      }
      if (active) setInitialized(true);
    })();
    return () => {
      active = false;
    };
  }, [loadMe]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      initialized,
      hasToken,
      login,
      register,
      refresh,
      loadMe,
      logout,
      clearError,
      requestWaOtp,
      verifyWaOtp,
    }),
    [
      user,
      loading,
      error,
      initialized,
      hasToken,
      login,
      register,
      refresh,
      requestWaOtp,
      verifyWaOtp,
      loadMe,
      logout,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
