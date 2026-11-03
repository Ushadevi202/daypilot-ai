import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // The Spring Boot API uses a cookie session with CSRF protection, so the browser must see
      // one origin. Requests to /api on this dev server are forwarded to the backend on port 8080.
      proxy: {
        '/api': 'http://localhost:8080',
      },
    },
  };
});
