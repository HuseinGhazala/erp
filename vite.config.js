import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // مسارات نسبية لتفادي الصفحة البيضاء على الاستضافة
})
