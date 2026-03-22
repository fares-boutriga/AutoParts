import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "scheduler": path.resolve(__dirname, "node_modules/scheduler/cjs/scheduler.development.js"),
    },
  },
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0)
    port: 5173, // Default Vite port
  },
})
