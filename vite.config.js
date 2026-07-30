import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // ngrok tunnel access — leading dot allows any *.ngrok-free.dev URL,
    // so it keeps working when ngrok rotates the subdomain
    allowedHosts: ['.ngrok-free.dev'],
  },
})
