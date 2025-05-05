import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.GIF", "**/*.gif"],
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  base: '/'
})
