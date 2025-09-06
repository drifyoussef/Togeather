import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/backoffice/' : '/',
  server: {
    port: 3001,
    host: true,
    allowedHosts: ['togeather.fr', 'localhost', '127.0.0.1']
  },
  build: {
    outDir: 'build'
  },
  define: {
    global: 'globalThis',
  }
}))
