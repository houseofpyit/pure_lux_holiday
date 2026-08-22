/**
 * Axios HTTP client — single entry point for all API requests.
 *
 * Responsibilities:
 *  - Base URL from environment variable (VITE_API_BASE_URL)
 *  - Attach Authorization: Bearer <access_token> on every request
 *  - On 401 response: attempt a single token refresh, retry the original request
 *  - On second 401 (refresh failed): clear tokens, redirect to /login
 *  - Forward all other errors to the caller
 *
 * Pages/components must NEVER import axios directly.
 * Use this client (via API modules) exclusively.
 */
import axios from 'axios';
import { getAccessToken, getRefreshToken, saveAccessToken, saveRefreshToken, clearTokens } from '@/auth/tokenStorage';
import { API_ROUTES } from '@/constants/apiRoutes';

// ---------------------------------------------------------------------------
// Create instance
// ---------------------------------------------------------------------------
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// ---------------------------------------------------------------------------
// Request interceptor — attach access token
// ---------------------------------------------------------------------------
client.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 + token refresh
// ---------------------------------------------------------------------------

// Tracks whether a refresh is already in flight so parallel 401 requests
// wait for the same refresh rather than each triggering their own.
let isRefreshing = false;
let pendingQueue = []; // [{resolve, reject}]

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and only once per request (_retry flag).
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === API_ROUTES.AUTH.REFRESH
    ) {
      return Promise.reject(normalizeError(error));
    }

    // If a refresh is already running, queue this request.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark this request as already retried to prevent infinite loops.
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      clearTokens();
      redirectToLogin();
      return Promise.reject(normalizeError(error));
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${API_ROUTES.AUTH.REFRESH}`,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const { access_token, refresh_token: newRefreshToken } = response.data;
      saveAccessToken(access_token);
      if (newRefreshToken) saveRefreshToken(newRefreshToken);

      processQueue(null, access_token);
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return client(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      redirectToLogin();
      return Promise.reject(normalizeError(refreshError));
    } finally {
      isRefreshing = false;
    }
  },
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Redirect to /login without leaving a history entry. */
function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

/**
 * Normalize an Axios error into a plain object so callers get a
 * consistent error shape regardless of whether it was a network
 * failure or an HTTP error response.
 *
 * @param {import('axios').AxiosError} error
 * @returns {{ message: string, status: number|null, data: any }}
 */
export function normalizeError(error) {
  if (error.response) {
    const detail = error.response.data?.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : error.response.statusText || 'An error occurred';
    return { message, status: error.response.status, data: error.response.data };
  }
  if (error.request) {
    return { message: 'Network error — please check your connection', status: null, data: null };
  }
  return { message: error.message || 'An unexpected error occurred', status: null, data: null };
}

export default client;
