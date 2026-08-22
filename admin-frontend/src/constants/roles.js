/**
 * User role constants — must match the backend UserRole enum exactly.
 * Never use raw strings for role comparisons.
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
};

/**
 * Role hierarchy levels — higher number = more access.
 * Use canAccess() instead of comparing strings directly.
 */
const ROLE_LEVEL = {
  [ROLES.EDITOR]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3,
};

/**
 * Check if a user's role meets the minimum required role level.
 *
 * @param {string} userRole  The user's current role.
 * @param {string} requiredRole  The minimum required role.
 * @returns {boolean}
 */
export function canAccess(userRole, requiredRole) {
  return (ROLE_LEVEL[userRole] ?? 0) >= (ROLE_LEVEL[requiredRole] ?? 99);
}
