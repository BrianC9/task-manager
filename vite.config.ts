import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "https://BrianC9.github.io/task-manager",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
