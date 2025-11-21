import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: false, // If port 5173 is in use, Vite will try the next available port
    // Allow requests from Render deployment
    allowedHosts: [
      'education-legalsys.onrender.com',
      'localhost',
      '127.0.0.1',
    ],
    proxy: {
      // Proxy API requests to backend during development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})







