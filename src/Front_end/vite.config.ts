import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import os from 'os'

export default defineConfig({
  plugins: [react()],
  cacheDir: path.resolve(os.tmpdir(), 'vite-cache-luxeway'),
  define: {
    // Fix: sockjs-client và các thư viện Node.js cần global/process trong browser
    'global': 'globalThis',
    'process.env': '{}',
    'process.version': '"v18.0.0"',
    'process.platform': '"browser"',
  },
  server: {
    port: 5173,
    host: true, // Listen on all local IPs
    strictPort: false,
    allowedHosts: true, // Allow ALL hosts through ngrok
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/oauth2/authorization': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/login/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state': ['zustand'],
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'vendor-ui': ['lucide-react', 'clsx'],
        },
      },
    },
  },
})