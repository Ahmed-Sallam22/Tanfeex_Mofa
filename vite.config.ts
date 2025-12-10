import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          // Remove console statements in production build
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
      // Code splitting for better caching and smaller bundle sizes
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-redux': ['react-redux', '@reduxjs/toolkit'],
            'vendor-i18n': ['react-i18next', 'i18next'],
          },
        },
      },
      // Target modern browsers for smaller bundle
      target: 'es2020',
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Chunk size warning limit
      chunkSizeWarningLimit: 500,
      // Enable source maps for production debugging (optional)
      sourcemap: isProduction ? false : true,
    },
    // Optimize dependencies pre-bundling
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'react-redux'],
    },
  }
})
