import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Suppress esbuild warning about '//' in SVG data URIs inside CSS
  esbuild: {
    logOverride: { 'js-comment-in-css': 'silent' }
  },
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Keep React + all its low-level deps together to prevent circular chunk loading
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/') ||
            id.includes('/react-is/')
          ) return 'vendor';
          if (id.includes('framer-motion')) return 'motion';
          if (
            id.includes('/three/') ||
            id.includes('/@react-three/')
          ) return 'three';
          if (id.includes('/sweetalert2/')) return 'sweetalert';
          // No catch-all — let Rollup auto-bundle the rest to avoid circular deps
        }
      }
    }
  }
})
