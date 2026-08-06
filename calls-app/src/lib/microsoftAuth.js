// Login con Microsoft 100% client-side (MSAL, app tipo "Single-page application").
// Solo necesita un Client ID público (Azure AD > App registrations). No requiere
// Client Secret ni backend. Ver README.md para los pasos.

import { PublicClientApplication } from '@azure/msal-browser';

const SCOPES = ['Calendars.Read'];

let msalInstance = null;
let initPromise = null;

export function isMicrosoftConfigured() {
  return Boolean(import.meta.env.VITE_MS_CLIENT_ID);
}

function getInstance() {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication({
      auth: {
        clientId: import.meta.env.VITE_MS_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MS_TENANT || 'common'}`,
        redirectUri: window.location.origin,
      },
      cache: { cacheLocation: 'sessionStorage' },
    });
  }
  return msalInstance;
}

async function ensureInitialized() {
  const instance = getInstance();
  if (!initPromise) initPromise = instance.initialize();
  await initPromise;
  return instance;
}

export async function connectMicrosoft() {
  const instance = await ensureInitialized();
  const result = await instance.loginPopup({ scopes: SCOPES });
  instance.setActiveAccount(result.account);
  return result.accessToken;
}

export async function getMicrosoftToken() {
  if (!isMicrosoftConfigured()) return null;
  const instance = await ensureInitialized();
  const account = instance.getActiveAccount() || instance.getAllAccounts()[0];
  if (!account) return null;
  try {
    const result = await instance.acquireTokenSilent({ scopes: SCOPES, account });
    return result.accessToken;
  } catch {
    return null;
  }
}

export async function disconnectMicrosoft() {
  const instance = await ensureInitialized();
  const account = instance.getActiveAccount();
  if (account) {
    await instance.logoutPopup({ account });
  }
}
