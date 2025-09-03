// filepath: /c:/Users/youss/Desktop/Togeather/backoffice/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      // Define all environment variables prefixed with VITE_ to be accessible in the frontend
      'process.env': {
        VITE_REACT_APP_API_URL: JSON.stringify(env.VITE_REACT_APP_API_URL),
        // Add other environment variables here as needed
      },
    },
    base: mode === 'production' ? '/backoffice/' : '/backoffice/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    server: {
      port: 3001,
      host: true,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        'togeather.fr',
        'www.togeather.fr'
      ],
    },
    plugins: [react()],
  };
});