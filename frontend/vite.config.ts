import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Polyfill undici with axios for browser compatibility
      'undici': 'axios'
    }
  },
  optimizeDeps: {
    include: ['@hirosystems/chainhooks-client'],
    exclude: ['undici']
  }
})