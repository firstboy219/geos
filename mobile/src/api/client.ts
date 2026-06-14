import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { authStorage } from '@/services/authStorage';

import { baseUrl, endpoints, requestTimeoutMs } from './endpoints';

/**
 * HTTP client wrapping axios.
 *
 * Responsibilities (ported from the Flutter `ApiService`):
 *  - base URL + 30s timeout
 *  - inject `Authorization: Bearer <token>` on every request
 *  - on `401` → refresh the access token once → retry the original request
 *  - if refresh fails → clear tokens and emit a force-logout event
 */

/** Listeners notified when refresh fails and the session must end. */
type LogoutListener = () => void;
const logoutListeners = new Set<LogoutListener>();

/** Subscribe to force-logout events. Returns an unsubscribe fn. */
export function onForceLogout(listener: LogoutListener): () => void {
  logoutListeners.add(listener);
  return () => logoutListeners.delete(listener);
}

function emitForceLogout(): void {
  logoutListeners.forEach((l) => l());
}

/** Auth endpoints that must not trigger the refresh/retry flow. */
const AUTH_PATHS: readonly string[] = [
  endpoints.refresh,
  endpoints.login,
  endpoints.register,
];

type RetriableConfig = InternalAxiosRequestConfig & { __retried__?: boolean };

export const apiClient: AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: requestTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor: inject bearer token ────────────────
apiClient.interceptors.request.use(async (config) => {
  const path = config.url ?? '';
  if (path !== endpoints.refresh) {
    const token = await authStorage.getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

// ── Refresh coordination ────────────────────────────────────
let isRefreshing = false;

async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing) return false;
  isRefreshing = true;
  try {
    const refreshToken = await authStorage.getRefreshToken();
    if (!refreshToken) return false;

    // Bare client so the interceptor chain does not recurse.
    const res = await axios.post<{
      access_token?: string;
      refresh_token?: string;
    }>(
      `${baseUrl}${endpoints.refresh}`,
      { refresh_token: refreshToken },
      { timeout: requestTimeoutMs },
    );

    const access = res.data?.access_token;
    const refresh = res.data?.refresh_token;
    if (!access || !refresh) return false;

    await authStorage.saveTokens(access, refresh);
    return true;
  } catch {
    return false;
  } finally {
    isRefreshing = false;
  }
}

// ── Response interceptor: refresh-once-then-retry on 401 ─────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const path = config?.url ?? '';

    const isUnauthorized = status === 401;
    const isAuthCall = AUTH_PATHS.includes(path);
    const alreadyRetried = config?.__retried__ === true;

    if (!isUnauthorized || isAuthCall || alreadyRetried || !config) {
      return Promise.reject(error);
    }

    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      await authStorage.clearTokens();
      emitForceLogout();
      return Promise.reject(error);
    }

    config.__retried__ = true;
    const newToken = await authStorage.getAccessToken();
    if (newToken) {
      config.headers.set('Authorization', `Bearer ${newToken}`);
    }
    return apiClient(config);
  },
);
