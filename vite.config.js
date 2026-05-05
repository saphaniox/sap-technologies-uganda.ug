import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["robots.txt", "images/logo2.jpg", "pwa-192.png", "pwa-512.png"],
      manifest: {
        name: "SAPTech Uganda",
        short_name: "SAPTech",
        description: "Professional in Engineering & Technology solutions",
        theme_color: "#1a237e",
        background_color: "#0f172a",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
        categories: ["business", "technology"],
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/sap-technologies-ug\.onrender\.com\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "cloudinary-images",
              expiration: { maxEntries: 100, maxAgeSeconds: 604800 }
            }
          }
        ]
      }
    })
  ],
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
