/**
 * handleApiError — centralized API error → toast message mapping.
 *
 * Translates HTTP status codes and known error messages into
 * user-friendly toast notifications.
 *
 * Usage:
 *   import { handleApiError } from '@/lib/handleApiError';
 *   try { ... } catch (err) { handleApiError(err); }
 *
 * The `toast` function is passed in as a parameter so this module
 * stays framework-agnostic and easily testable.
 */

/**
 * @param {object} error  Normalized error from normalizeError() in api/client.js
 *                        Shape: { message: string, status: number|null, data: any }
 * @param {Function} toast  The toast() function from useToast()
 * @param {object} [overrides]  Optional per-status message overrides
 */
export function handleApiError(error, toast, overrides = {}) {
  const status = error?.status ?? null;
  const defaultMessage = error?.message || 'An unexpected error occurred';

  const message = overrides[status] ?? getDefaultMessage(status, defaultMessage);

  toast({
    title: getTitleForStatus(status),
    description: message,
    variant: 'destructive',
  });
}

function getTitleForStatus(status) {
  switch (status) {
    case 401: return 'Session expired';
    case 403: return 'Access denied';
    case 404: return 'Not found';
    case 422: return 'Validation error';
    case 500: return 'Server error';
    case null: return 'Network error';
    default: return 'Error';
  }
}

function getDefaultMessage(status, fallback) {
  switch (status) {
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 422:
      return fallback || 'Please check the form fields and try again.';
    case 500:
      return 'An internal server error occurred. Please try again later.';
    case null:
      return 'Unable to reach the server. Please check your connection.';
    default:
      return fallback;
  }
}
