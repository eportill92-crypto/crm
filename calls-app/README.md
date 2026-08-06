# Unified Calls

Vista unificada de llamadas/reuniones (estilo Google Meet) que junta
eventos de **Google Calendar** y **Microsoft 365 / Teams** en un solo
lugar, con acceso directo para unirte a cada llamada. Detecta
automáticamente si el link de la reunión es de Meet, Teams o Zoom
(y lo etiqueta), sin importar en qué calendario esté guardado.

Esta carpeta es una app independiente (no depende del resto del CRM en
este repositorio).

## Cómo funciona la conexión

No hay backend ni servidor propio: el login es 100% desde el navegador
("Sign in with Google" / login de Microsoft), usando OAuth con **PKCE**.
Eso significa que solo necesitas un **Client ID** (un identificador
público, no un secreto) por proveedor — nunca un Client Secret ni un
servidor que lo resguarde.

> Zoom no se conecta por su propia API: su API no permite llamadas
> directas desde el navegador (bloqueo CORS), así que requeriría un
> backend. En cambio, si una reunión de Zoom llega como invitación a tu
> Google Calendar o a tu calendario de Microsoft (lo normal cuando alguien
> te invita por correo/calendario), esta app ya la detecta y la muestra
> etiquetada como "Zoom" con su botón "Unirse".

Sin ningún proveedor conectado, la app muestra datos de ejemplo para que
puedas ver la interfaz funcionando.

## Ejecutar en local

```bash
cd calls-app
npm install
cp .env.example .env.local   # y llena los Client ID (ver abajo)
npm run dev
```

## Configurar Google Calendar

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) → crea
   o selecciona un proyecto.
2. **APIs & Services > Library** → busca "Google Calendar API" → habilítala.
3. **APIs & Services > OAuth consent screen** → configúrala (tipo
   "External" si usas tu cuenta personal/gmail, o "Internal" si es un
   Google Workspace y quieres restringirlo a tu organización). Agrega el
   scope `.../auth/calendar.readonly`.
4. **APIs & Services > Credentials > Create Credentials > OAuth client ID**
   → tipo **"Web application"**.
5. En **Authorized JavaScript origins** agrega `http://localhost:5173` (y
   luego la URL donde despliegues la app, ej. `https://tu-app.netlify.app`).
6. Copia el **Client ID** generado (termina en `.apps.googleusercontent.com`)
   a `VITE_GOOGLE_CLIENT_ID` en tu `.env.local`.
7. Si tu OAuth consent screen quedó en modo "Testing", agrega tu correo en
   **Test users** para poder autorizarlo.

## Configurar Microsoft 365 / Teams

1. Ve a [Azure Portal > App registrations](https://entra.microsoft.com/)
   → **New registration**.
2. En **Supported account types** elige la opción según tu caso (solo tu
   organización, o cuentas personales + organizacionales).
3. En **Redirect URI** selecciona plataforma **"Single-page application
   (SPA)"** y agrega `http://localhost:5173` (y luego tu dominio de
   producción).
4. **API permissions > Add a permission > Microsoft Graph > Delegated
   permissions** → agrega `Calendars.Read`.
5. Si tu organización lo requiere, pide a tu administrador de TI que dé
   "Grant admin consent" a ese permiso.
6. Copia el **Application (client) ID** a `VITE_MS_CLIENT_ID` en tu
   `.env.local`. Si tu tenant lo exige, copia también el **Directory
   (tenant) ID** a `VITE_MS_TENANT` (si no, deja `common`).

## Estructura

```
calls-app/
  src/
    App.jsx                 orquesta login, conexión y vista del día
    components/              DateStrip, CallList, CallCard, ProviderStatus...
    lib/
      googleAuth.js          login con Google (Google Identity Services, PKCE)
      microsoftAuth.js       login con Microsoft (MSAL, SPA/PKCE)
      providers.js           llamadas a Google Calendar API / Microsoft Graph + detección de plataforma
      calendarService.js     agrega eventos de los proveedores conectados (o mock si no hay ninguno)
    data/mockEvents.js       datos de ejemplo para cuando no hay nada conectado
```

## Notas de seguridad

- Los tokens de acceso viven solo en `sessionStorage` del navegador (se
  borran al cerrar la pestaña) y nunca se envían a ningún servidor propio.
- `.env.local` está en `.gitignore` — no se sube al repositorio.
- Los Client ID son públicos por diseño (así funciona OAuth con PKCE para
  apps sin backend), pero **nunca** agregues un Client Secret a este
  proyecto: si algún día necesitas uno (por ejemplo, para Zoom), debe vivir
  en un servidor, no en código de frontend.
