import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' hace que el build funcione en cualquier subcarpeta (Netlify, Vercel, GitHub Pages, o abriendo dist/ a mano).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    open: true,
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
      },
    },
  },
})
