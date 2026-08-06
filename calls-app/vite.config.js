import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En GitHub Pages este proyecto vive bajo /crm/ (Pages de proyecto, no de usuario).
// En local (npm run dev) sigue sirviendo desde la raíz.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/crm/' : '/',
  server: { port: 5173 },
}));
