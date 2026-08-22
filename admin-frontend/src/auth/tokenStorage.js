/**
 * Token storage — the ONLY module that may read/write tokens from localStorage.
 *
 * All other modules (API client, AuthService, AuthContext, pages) must call
 * these functions instead of accessing localStorage directly.
 *
 * Keys are intentionally prefixed so they don't collide with anything else.
 */

const KEYS = {
  ACCESS_TOKEN: 'gsf_access_token',
  REFRESH_TOKEN: 'gsf_refresh_token',
};

/**
 * Persist the JWT access token.
 * @param {string} token
 */
export function saveAccessToken(token) {
  localStorage.setItem(KEYS.ACCESS_TOKEN, token);
}

/**
 * Persist the JWT refresh token.
 * @param {string} token
 */
export function saveRefreshToken(token) {
  localStorage.setItem(KEYS.REFRESH_TOKEN, token);
}

/**
 * Retrieve the stored access token, or null if absent.
 * @returns {string|null}
 */
export function getAccessToken() {
  return localStorage.getItem(KEYS.ACCESS_TOKEN);
}

/**
 * Retrieve the stored refresh token, or null if absent.
 * @returns {string|null}
 */
export function getRefreshToken() {
  return localStorage.getItem(KEYS.REFRESH_TOKEN);
}

/**
 * Remove both tokens (called on logout or auth failure).
 */
export function clearTokens() {
  localStorage.removeItem(KEYS.ACCESS_TOKEN);
  localStorage.removeItem(KEYS.REFRESH_TOKEN);
}

/**
 * Convenience: save both tokens at once (e.g. after login or refresh).
 * @param {{ access_token: string, refresh_token: string }} tokens
 */
export function saveTokens({ access_token, refresh_token }) {
  saveAccessToken(access_token);
  saveRefreshToken(refresh_token);
}
