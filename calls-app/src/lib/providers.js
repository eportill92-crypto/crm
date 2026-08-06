// Cada proveedor expone getEvents({ from, to }) -> Promise<CallEvent[]>
// CallEvent: { id, title, start (Date), end (Date), platform, joinUrl, source }
// platform: 'meet' | 'teams' | 'zoom' | 'phone' | 'other'

export const PROVIDERS = {
  google: {
    id: 'google',
    label: 'Google Calendar',
    connected: false,
    // TODO integración real:
    // 1. Crear proyecto OAuth en Google Cloud Console, habilitar Calendar API.
    // 2. Guardar CLIENT_ID / CLIENT_SECRET como variables de entorno (nunca en el repo).
    // 3. Implementar el flujo OAuth (Authorization Code + refresh token).
    // 4. Reemplazar getEvents por una llamada a
    //    GET https://www.googleapis.com/calendar/v3/calendars/primary/events
    async getEvents() {
      return [];
    },
  },
  microsoft: {
    id: 'microsoft',
    label: 'Microsoft 365 / Teams',
    connected: false,
    // TODO integración real:
    // 1. Registrar la app en Azure AD (Microsoft Entra ID), permisos Calendars.Read.
    // 2. Implementar el flujo OAuth (MSAL) y guardar el token de forma segura.
    // 3. Reemplazar getEvents por una llamada a Microsoft Graph:
    //    GET https://graph.microsoft.com/v1.0/me/calendarview
    async getEvents() {
      return [];
    },
  },
};

export function detectPlatform(joinUrl = '') {
  const url = joinUrl.toLowerCase();
  if (url.includes('meet.google.com')) return 'meet';
  if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) return 'teams';
  if (url.includes('zoom.us')) return 'zoom';
  if (!url) return 'phone';
  return 'other';
}
