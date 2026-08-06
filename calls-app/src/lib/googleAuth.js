// Login "Sign in with Google" 100% client-side (Google Identity Services).
// Solo necesita un Client ID público (Google Cloud Console > Credentials).
// No requiere Client Secret ni backend. Ver README.md para los pasos.

const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const STORAGE_KEY = 'unified-calls:google-token';

let tokenClient = null;
let accessToken = null;
let expiresAt = 0;

function restoreFromSession() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const { token, expiresAt: exp } = JSON.parse(raw);
    if (exp > Date.now()) {
      accessToken = token;
      expiresAt = exp;
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
restoreFromSession();

export function isGoogleConfigured() {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
}

export function getGoogleToken() {
  return accessToken && expiresAt > Date.now() ? accessToken : null;
}

function ensureTokenClient() {
  if (tokenClient) return tokenClient;
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services todavía no cargó. Intenta de nuevo en un momento.');
  }
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope: SCOPE,
    callback: () => {},
  });
  return tokenClient;
}

export function connectGoogle() {
  return new Promise((resolve, reject) => {
    try {
      const client = ensureTokenClient();
      client.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        accessToken = response.access_token;
        expiresAt = Date.now() + (response.expires_in - 60) * 1000;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: accessToken, expiresAt }));
        resolve(accessToken);
      };
      client.error_callback = (err) => reject(new Error(err?.message || 'No se pudo conectar con Google.'));
      client.requestAccessToken({ prompt: getGoogleToken() ? '' : 'consent' });
    } catch (err) {
      reject(err);
    }
  });
}

export function disconnectGoogle() {
  const token = accessToken;
  accessToken = null;
  expiresAt = 0;
  sessionStorage.removeItem(STORAGE_KEY);
  if (token && window.google?.accounts?.oauth2?.revoke) {
    window.google.accounts.oauth2.revoke(token, () => {});
  }
}
