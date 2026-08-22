/**
 * AuthContext — provides authentication state and actions to the entire app.
 *
 * State:
 *  user          — current user object or null
 *  loading       — true while any auth operation is in-flight
 *  authenticated — true when the user is logged in
 *  role          — shortcut to user.role (or null)
 *
 * Actions:
 *  login(credentials)  — authenticate and store session
 *  logout()            — clear session and redirect to /login
 *  restoreSession()    — called once on mount; re-hydrates state from stored tokens
 *  loadCurrentUser()   — fetch /me from the backend and update state
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AuthService from '@/auth/authService';
import { clearTokens, getAccessToken } from '@/auth/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // starts true for session restore
  const [authenticated, setAuthenticated] = useState(false);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const setSession = (userData) => {
    setUser(userData);
    setAuthenticated(true);
  };

  const clearSession = () => {
    setUser(null);
    setAuthenticated(false);
  };

  // ---------------------------------------------------------------------------
  // restoreSession — called once on app mount
  // ---------------------------------------------------------------------------
  const restoreSession = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const userData = await AuthService.currentUser();
      setSession(userData);
    } catch {
      // Token is invalid / expired and refresh also failed (the Axios client
      // already attempted refresh; if we're here it couldn't recover).
      clearTokens();
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore session when the app first loads.
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ---------------------------------------------------------------------------
  // loadCurrentUser — re-fetch the user profile (e.g. after profile update)
  // ---------------------------------------------------------------------------
  const loadCurrentUser = useCallback(async () => {
    try {
      const userData = await AuthService.currentUser();
      setUser(userData);
    } catch {
      clearTokens();
      clearSession();
    }
  }, []);

  // ---------------------------------------------------------------------------
  // login
  // ---------------------------------------------------------------------------
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { user: userData } = await AuthService.login(credentials);
      setSession(userData);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // logout
  // ---------------------------------------------------------------------------
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.logout();
    } finally {
      clearSession();
      setLoading(false);
      // Use replace so the login page doesn't appear in history.
      window.location.replace('/login');
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------
  const value = {
    user,
    loading,
    authenticated,
    role: user?.role ?? null,
    permissions: user?.permissions ?? [],
    login,
    logout,
    restoreSession,
    loadCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth — consume authentication state anywhere in the tree.
 *
 * @returns {{ user, loading, authenticated, role, permissions, login, logout, restoreSession, loadCurrentUser }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
