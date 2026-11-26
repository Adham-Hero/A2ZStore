import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// In development the website (port 5173) forwards /api/* to the Node server (port 5000).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': { target: `http://localhost:${process.env.PORT || 5000}` } },
  },
})
