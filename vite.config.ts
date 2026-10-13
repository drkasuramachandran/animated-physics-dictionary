import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Root base is correct for a custom domain such as physics.drkasuramachandran.com.
  base: '/',
})