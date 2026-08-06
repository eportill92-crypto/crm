# Unified Calls

Vista unificada de llamadas/reuniones (estilo Google Meet) que junta
eventos de **Google Calendar** y **Microsoft 365 / Teams** en un solo
lugar, con acceso directo para unirte a cada llamada. Detecta
automáticamente si el link de la reunión es de Meet, Teams o Zoom
(y lo etiqueta), sin importar en qué calendario esté guardado.

Esta carpeta es una app independiente (no depende del resto del CRM en
este repositorio).

## Cómo se conecta cada proveedor

**Google Calendar — sin login, sin Google Cloud Console.** Usa el
"enlace privado en formato iCal" que cualquier cuenta de Google puede
generar desde los Ajustes normales de Calendar (no requiere permisos
especiales ni acceso a la Cloud Console). Una función serverless
(`api/calendar.js`, pensada para Vercel) lee ese enlace en el servidor y
le entrega los eventos ya listos al navegador — así evitamos el bloqueo
de CORS que impide leerlo directamente desde el navegador.

**Microsoft 365 / Teams — login normal (MSAL, sin backend).** Si en el
futuro tienes acceso a Azure AD, puedes activar el botón "Conectar" que
ya existe en la interfaz. Ver la sección más abajo.

> Zoom no se conecta por su propia API (no permite llamadas desde el
> navegador). En cambio, si una reunión de Zoom llega como invitación a tu
> Google Calendar o a tu calendario de Microsoft (lo normal cuando alguien
> te invita por correo/calendario), esta app ya la detecta y la muestra
> etiquetada como "Zoom" con su botón "Unirse".

Sin ningún proveedor conectado, la app muestra datos de ejemplo para que
puedas ver la interfaz funcionando.

## Desplegar en Vercel (necesario para Google — usa la función `/api`)

GitHub Pages (el otro despliegue de este repo) solo sirve archivos
estáticos y no puede correr `api/calendar.js`, así que para Google
Calendar el despliegue real es en Vercel:

1. En tu cuenta de Vercel (ya tienes una conectada a este repo) → **Add
   New → Project** → importa este mismo repositorio de GitHub.
2. En **Root Directory** selecciona `calls-app` (importante: no dejar la
   raíz del repo, ahí vive el CRM de Comensaia).
3. Framework: Vercel detecta Vite automáticamente. No hace falta tocar
   build command / output directory (ya están en `calls-app/vercel.json`).
4. Antes de darle "Deploy", ve a **Environment Variables** y agrega:
   - `GOOGLE_ICAL_URL` = tu enlace secreto de Google Calendar (ver abajo
     cómo obtenerlo). **Pégalo directo en Vercel — nunca lo compartas por
     chat ni lo subas al repositorio**, es como una contraseña de solo
     lectura de tu calendario.
5. Deploy. Vercel te da la URL pública (algo como
   `https://unified-calls-tuusuario.vercel.app`).

## Obtener el enlace secreto de Google Calendar

1. Abre [Google Calendar](https://calendar.google.com/) en tu navegador
   (con tu cuenta normal, la misma que ves en la captura de Meet).
2. Ajustes (ícono de engrane) → **Configuración**.
3. En la columna izquierda, bajo "Configuración de mis calendarios",
   elige tu calendario (normalmente tu correo).
4. Baja hasta **"Integrar calendario"**.
5. Copia la **"Dirección secreta en formato iCal"** — es una URL larga
   que termina en `.ics`.
6. Pégala como `GOOGLE_ICAL_URL` en Vercel (paso anterior). Cualquiera
   con esa URL puede leer tu calendario, así que trátala como una
   contraseña: no la mandes por chat/email sin cifrar, y si alguna vez se
   filtra, puedes generar una nueva desde esta misma pantalla (botón
   "Restablecer").

## Ejecutar en local

```bash
cd calls-app
npm install
npm run dev
```

Sin `GOOGLE_ICAL_URL` configurado (normal en local, ya que la función
`/api` solo corre en Vercel) verás los datos de ejemplo. Para probar la
función localmente con datos reales puedes usar `vercel dev` en vez de
`npm run dev`, con un `.env.local` que tenga `GOOGLE_ICAL_URL=...`.

## Configurar Microsoft 365 / Teams (opcional)

1. Ve a [Azure Portal > App registrations](https://entra.microsoft.com/)
   → **New registration**.
2. En **Supported account types** elige la opción según tu caso (solo tu
   organización, o cuentas personales + organizacionales).
3. En **Redirect URI** selecciona plataforma **"Single-page application
   (SPA)"** y agrega `http://localhost:5173` (y luego tu dominio de Vercel).
4. **API permissions > Add a permission > Microsoft Graph > Delegated
   permissions** → agrega `Calendars.Read`.
5. Si tu organización lo requiere, pide a tu administrador de TI que dé
   "Grant admin consent" a ese permiso.
6. Copia el **Application (client) ID** a `VITE_MS_CLIENT_ID` (variable de
   entorno en Vercel, o en tu `.env.local` para probar en local). Si tu
   tenant lo exige, copia también el **Directory (tenant) ID** a
   `VITE_MS_TENANT` (si no, deja `common`).

## Alternativa: Google con login OAuth (si algún día tienes Cloud Console)

El código para "Sign in with Google" (`src/lib/googleAuth.js`) sigue en
el repo por si en el futuro tienes acceso a la Google Cloud Console —
tiene la ventaja de no depender de un enlace secreto de por vida. Para
activarlo: vuelve a agregar el script de Google Identity Services en
`index.html`, crea un Client ID (pasos en el historial de este README) y
cámbialo por la conexión automática en `App.jsx`.

## Estructura

```
calls-app/
  api/
    calendar.js              función serverless (Vercel): lee el enlace secreto de Google Calendar
  src/
    App.jsx                  orquesta la conexión y la vista del día
    components/               DateStrip, CallList, CallCard, ProviderStatus...
    lib/
      googleIcal.js          llama a /api/calendar desde el navegador
      googleAuth.js          alternativa OAuth para Google (ver sección de arriba), no usada por defecto
      microsoftAuth.js       login con Microsoft (MSAL, SPA/PKCE)
      providers.js           Microsoft Graph + detección de plataforma (Meet/Teams/Zoom)
      calendarService.js     agrega eventos de los proveedores conectados (o mock si no hay ninguno)
    data/mockEvents.js        datos de ejemplo para cuando no hay nada conectado
```

## Notas de seguridad

- `GOOGLE_ICAL_URL` es el dato más sensible de este proyecto: da acceso de
  lectura a tu calendario a quien la tenga. Vive solo como variable de
  entorno en Vercel — nunca en el código ni en el repositorio.
- La función `api/calendar.js` nunca reenvía esa URL al navegador, solo
  los eventos ya procesados.
- `.env.local` está en `.gitignore` — no se sube al repositorio.
- Los Client ID de Microsoft son públicos por diseño (OAuth con PKCE para
  apps sin backend), pero **nunca** agregues un Client Secret a este
  proyecto: si algún día lo necesitas, debe vivir en un servidor, no en
  código de frontend.
