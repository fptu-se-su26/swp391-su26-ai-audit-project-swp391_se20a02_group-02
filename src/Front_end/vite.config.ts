import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Use modern Sass API to suppress legacy-js-api deprecation warning from stompjs
        api: 'modern-compiler',
      },
    },
  },
  server: {
    proxy: {
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management
          'vendor-state': ['zustand'],
          // Animation library
          'vendor-motion': ['framer-motion'],
          // Chart / visualization
          'vendor-charts': ['recharts'],
          // i18n
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          // WebSocket / messaging
          'vendor-ws': ['stompjs', 'sockjs-client'],
          // UI utilities
          'vendor-ui': ['lucide-react', 'clsx'],
        },
      },
    },
  },
})
