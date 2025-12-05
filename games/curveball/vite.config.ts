import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: { port: 2006, strictPort: true, host: '127.0.0.1' }
})
