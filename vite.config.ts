import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'artico.in.th'
    ],
    hmr: {
      host: 'artico.in.th',
      protocol: 'wss'
    }
  }
})