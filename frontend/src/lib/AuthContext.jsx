/**
 * AuthContext — simplified for the public frontend.
 *
 * The public site has no login requirement. This context exists only
 * to satisfy the AuthProvider / useAuth interface that App.jsx expects.
 * All loading flags are immediately false so the app renders without delay.
 */
import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => (
  <AuthContext.Provider
    value={{
      user: null,
      isAuthenticated: false,
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      authChecked: true,
      logout: () => {},
      navigateToLogin: () => {},
      checkUserAuth: async () => {},
      checkAppState: async () => {},
    }}
  >
    {children}
  </AuthContext.Provider>
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
