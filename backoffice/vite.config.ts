import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/backoffice/' : '/',
  server: {
    port: 3001,
    host: true,
    allowedHosts: ['togeather.fr', 'localhost', '127.0.0.1'],
    hmr: {
      host: 'localhost'
    }
  },
  build: {
    outDir: 'build'
  },
  define: {
    global: 'globalThis',
  }
})
