const VISITOR_KEY = 'gsf_visitor_id';

function createVisitorId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `v-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = createVisitorId();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return createVisitorId();
  }
}

export function getPageReferrer() {
  if (typeof document === 'undefined') return null;
  return document.referrer || null;
}
