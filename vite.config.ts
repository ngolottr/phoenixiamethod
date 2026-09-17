import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' hace que el build funcione en cualquier subcarpeta (Netlify, Vercel, GitHub Pages, o abriendo dist/ a mano).
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    open: mode !== 'conapi',
    // `vite --mode conapi`: las funciones de /api las sirve `vercel dev` en el
    // 3000 (ver .claude/launch.json). Vercel dev solo no sirve para mirar el
    // sitio: aplica la política de seguridad de vercel.json y esa bloquea la
    // recarga en caliente de Vite.
    proxy: mode === 'conapi' ? { '/api': 'http://localhost:3000' } : undefined,
  },
  build: {
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      // Dos páginas independientes: el portfolio y la de reserva de hora.
      // La de reserva no arrastra React, así carga en un parpadeo.
      input: {
        main: 'index.html',
        agendar: 'agendar.html',
        // El panel privado de estadísticas. También sin React.
        panel: 'panel.html',
      },
    },
  },
}))
