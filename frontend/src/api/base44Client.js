import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

function createNoopClient() {
  const notConfigured = () => Promise.reject(new Error('Base44 is not configured for this app.'));
  return {
    auth: {
      me: notConfigured,
      loginViaEmailPassword: notConfigured,
      register: notConfigured,
      verifyOtp: notConfigured,
      resendOtp: notConfigured,
      resetPassword: notConfigured,
      resetPasswordRequest: notConfigured,
      loginWithProvider: notConfigured,
      setToken: () => {},
      logout: () => {},
    },
  };
}

export const base44 = appId
  ? createClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      requiresAuth: false,
      appBaseUrl,
    })
  : createNoopClient();
