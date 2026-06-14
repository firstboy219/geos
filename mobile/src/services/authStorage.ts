import * as SecureStore from 'expo-secure-store';

/**
 * Securely stores and retrieves JWT tokens via the platform keystore /
 * keychain (expo-secure-store).
 *
 * Ported from the Flutter `AuthService`. Holds no user state and makes no
 * network calls — pure token persistence. Token-refresh networking lives in
 * the axios client / AuthContext.
 */
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

/** True when an access token is present (does NOT validate expiry). */
export async function hasToken(): Promise<boolean> {
  const token = await getAccessToken();
  return token != null && token.length > 0;
}

export async function saveTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function saveAccessToken(accessToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

export const authStorage = {
  getAccessToken,
  getRefreshToken,
  hasToken,
  saveTokens,
  saveAccessToken,
  clearTokens,
};
