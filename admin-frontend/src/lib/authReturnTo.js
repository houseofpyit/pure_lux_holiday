// Safe same-origin redirect helper.
// Resolves ?returnTo= to a safe same-origin path, else "/".
// Prevents open-redirect via protocol-relative or backslash tricks.
export function safeReturnTo() {
  const raw = new URLSearchParams(window.location.search).get('returnTo');
  if (!raw) return '/';
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return '/';
    const path = url.pathname + url.search;
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return '/';
    return path;
  } catch {
    return '/';
  }
}
