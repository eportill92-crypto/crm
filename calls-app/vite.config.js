import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En GitHub Pages este proyecto vive bajo /crm/ (Pages de proyecto, no de
// usuario) — el workflow de Actions pone GITHUB_PAGES=true al construir.
// En Vercel (que sí sirve /api, necesario para el enlace secreto de Google
// Calendar) y en local vive en la raíz.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' && process.env.GITHUB_PAGES ? '/crm/' : '/',
  server: { port: 5173 },
}));
