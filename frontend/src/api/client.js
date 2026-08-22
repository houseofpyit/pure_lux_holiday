export const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor({ status = null, message, detail = null, fieldErrors = {}, cause } = {}) {
    super(message || 'Something went wrong');
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
    this.cause = cause;
  }
}

export function normalizeApiError(error, fallbackMessage = 'Request failed') {
  if (error instanceof ApiError) return error;

  if (error?.name === 'AbortError') {
    return new ApiError({
      status: null,
      message: 'Request timed out',
      detail: error.message,
      cause: error,
    });
  }

  return new ApiError({
    status: null,
    message: error?.message || fallbackMessage,
    detail: error,
    cause: error,
  });
}

function buildUrl(path, params) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

function getFieldErrors(detail) {
  if (!Array.isArray(detail)) return {};

  return detail.reduce((errors, item) => {
    const location = Array.isArray(item?.loc) ? item.loc.filter((part) => part !== 'body') : [];
    const field = location.join('.');
    if (field) errors[field] = item?.msg || 'Invalid value';
    return errors;
  }, {});
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function getErrorMessage(payload, status) {
  if (typeof payload === 'string' && payload) return payload;
  if (typeof payload?.detail === 'string') return payload.detail;
  if (payload?.message) return payload.message;
  if (Array.isArray(payload?.detail)) return 'Please check the highlighted fields.';
  if (status >= 500) return 'The server could not complete the request.';
  if (status === 404) return 'The requested content was not found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  return 'Request failed';
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    params,
    headers,
    timeout = 15000,
    signal,
  } = options;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const isFormData = body instanceof FormData;
  const requestHeaders = {
    Accept: 'application/json',
    ...(!isFormData && body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  try {
    const response = await fetch(buildUrl(path, params), {
      method,
      headers: requestHeaders,
      body: isFormData || body === undefined ? body : JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError({
        status: response.status,
        message: getErrorMessage(payload, response.status),
        detail: payload?.detail ?? payload,
        fieldErrors: getFieldErrors(payload?.detail),
      });
    }

    return payload;
  } catch (error) {
    throw normalizeApiError(error);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  request,
};
