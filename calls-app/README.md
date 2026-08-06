# Unified Calls

Prototipo visual de una vista unificada de llamadas/reuniones (estilo
Google Meet) que junta eventos de **Google Calendar**, **Microsoft
Teams/365** y otras plataformas en un solo lugar, con acceso directo para
unirse a cada llamada.

Esta carpeta es una app independiente (no depende del resto del CRM en este
repositorio).

## Estado actual

Este es el **prototipo visual**: la interfaz (franja de fechas, secciones
"Pasadas" / "Programadas", tarjetas de llamada, botón "Unirse") funciona
con datos de ejemplo (`src/data/mockEvents.js`). Aún no está conectado a
Google Calendar ni a Microsoft Graph.

## Ejecutar en local

```bash
cd calls-app
npm install
npm run dev
```

## Cómo conectar los proveedores reales

La lógica de proveedores vive en `src/lib/providers.js` y el agregador en
`src/lib/calendarService.js` (con el flag `USE_MOCK_DATA`). Para pasar a
datos reales:

### Google Calendar
1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
   y habilita la **Google Calendar API**.
2. Crea credenciales OAuth 2.0 (tipo "Aplicación web") y agrega tu URL de
   redirección.
3. Guarda `CLIENT_ID` / `CLIENT_SECRET` como variables de entorno — nunca
   los subas al repositorio.
4. Implementa el flujo OAuth (Authorization Code) y usa el token para
   llamar a `GET https://www.googleapis.com/calendar/v3/calendars/primary/events`.
5. Reemplaza el `getEvents()` de `PROVIDERS.google` en `providers.js`.

### Microsoft Teams / 365
1. Registra la app en [Azure AD / Microsoft Entra ID](https://entra.microsoft.com/)
   con el permiso `Calendars.Read`.
2. Implementa el login con [MSAL](https://learn.microsoft.com/en-us/entra/identity-platform/msal-overview).
3. Llama a Microsoft Graph: `GET https://graph.microsoft.com/v1.0/me/calendarview`.
4. Reemplaza el `getEvents()` de `PROVIDERS.microsoft` en `providers.js`.

Una vez que al menos un proveedor tenga `connected: true` y devuelva
eventos reales, cambia `USE_MOCK_DATA` a `false` en `calendarService.js`.

## Estructura

```
calls-app/
  src/
    App.jsx                 punto de entrada de la UI
    components/              DateStrip, CallList, CallCard, ProviderStatus...
    lib/
      providers.js          definición de proveedores (Google, Microsoft) + detección de plataforma
      calendarService.js    agrega eventos de todos los proveedores conectados
    data/mockEvents.js       datos de ejemplo para el prototipo
```
