/**
 * Auth API module — thin wrappers around the Axios client for auth endpoints.
 *
 * These functions are the ONLY place that calls the API directly.
 * AuthService calls these; React pages/components call AuthService.
 *
 * Every function returns the parsed response data on success and
 * throws a normalized error object on failure.
 */
import client from '@/api/client';
import { API_ROUTES } from '@/constants/apiRoutes';

/**
 * POST /api/v1/auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<import('@/types/auth').LoginResponse>}
 */
export async function loginRequest(credentials) {
  const response = await client.post(API_ROUTES.AUTH.LOGIN, credentials);
  return response.data;
}

/**
 * POST /api/v1/auth/logout
 * @param {string} refreshToken  Optional refresh token to also blacklist.
 * @returns {Promise<{ message: string }>}
 */
export async function logoutRequest(refreshToken) {
  const body = refreshToken ? { refresh_token: refreshToken } : {};
  const response = await client.post(API_ROUTES.AUTH.LOGOUT, body);
  return response.data;
}

/**
 * POST /api/v1/auth/refresh
 * @param {string} refreshToken
 * @returns {Promise<import('@/types/auth').LoginResponse>}
 */
export async function refreshRequest(refreshToken) {
  const response = await client.post(API_ROUTES.AUTH.REFRESH, {
    refresh_token: refreshToken,
  });
  return response.data;
}

/**
 * GET /api/v1/auth/me
 * @returns {Promise<import('@/types/auth').CurrentUser>}
 */
export async function getMeRequest() {
  const response = await client.get(API_ROUTES.AUTH.ME);
  return response.data;
}

/**
 * POST /api/v1/auth/change-password
 * @param {{ current_password: string, new_password: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export async function changePasswordRequest(payload) {
  const response = await client.post(API_ROUTES.AUTH.CHANGE_PASSWORD, payload);
  return response.data;
}

/**
 * POST /api/v1/auth/forgot-password
 * @param {string} email
 * @returns {Promise<{ message: string }>}
 */
export async function forgotPasswordRequest(email) {
  const response = await client.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email });
  return response.data;
}

/**
 * POST /api/v1/auth/reset-password
 * @param {{ token: string, new_password: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export async function resetPasswordRequest(payload) {
  const response = await client.post(API_ROUTES.AUTH.RESET_PASSWORD, payload);
  return response.data;
}
