/**
 * AuthService — business logic layer between the React UI and the API.
 *
 * Pages and components must never call auth API functions directly.
 * They interact with AuthService (or via AuthContext which wraps it).
 *
 * Responsibilities:
 *  - Call auth.api.js functions
 *  - Persist / clear tokens via tokenStorage
 *  - Return typed results to callers
 *  - Never manipulate DOM or React state
 */
import {
  loginRequest,
  logoutRequest,
  getMeRequest,
  refreshRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
  changePasswordRequest,
} from '@/api/auth.api';
import {
  saveTokens,
  clearTokens,
  getRefreshToken,
} from '@/auth/tokenStorage';

const AuthService = {
  /**
   * Authenticate with email + password.
   * Saves tokens to storage on success.
   *
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user: CurrentUser }>}
   */
  async login(credentials) {
    const data = await loginRequest(credentials);
    saveTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    return { user: data.user };
  },

  /**
   * Logout the current session.
   * Clears tokens from storage regardless of server response.
   *
   * @returns {Promise<void>}
   */
  async logout() {
    const refreshToken = getRefreshToken();
    try {
      await logoutRequest(refreshToken);
    } catch {
      // Always clear tokens even if the server call fails.
    } finally {
      clearTokens();
    }
  },

  /**
   * Exchange the stored refresh token for a new access token.
   * Saves updated tokens on success.
   *
   * @returns {Promise<{ user: CurrentUser }>}
   */
  async refresh() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw { message: 'No refresh token available', status: 401, data: null };
    }
    const data = await refreshRequest(refreshToken);
    saveTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    return { user: data.user };
  },

  /**
   * Fetch the currently authenticated user from the backend.
   *
   * @returns {Promise<CurrentUser>}
   */
  async currentUser() {
    return getMeRequest();
  },

  /**
   * Send a forgot-password email (backend decides if the address exists).
   *
   * @param {string} email
   * @returns {Promise<{ message: string }>}
   */
  async forgotPassword(email) {
    return forgotPasswordRequest(email);
  },

  /**
   * Complete the password reset flow using the token from the reset link.
   *
   * @param {{ token: string, new_password: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  async resetPassword(payload) {
    return resetPasswordRequest(payload);
  },

  /**
   * Change the password for the currently logged-in user.
   *
   * @param {{ current_password: string, new_password: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  async changePassword(payload) {
    return changePasswordRequest(payload);
  },
};

export default AuthService;
