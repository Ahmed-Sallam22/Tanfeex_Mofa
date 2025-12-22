import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Image optimization for production builds
      isProduction && ViteImageOptimizer({
        jpg: {
          quality: 80,
        },
        jpeg: {
          quality: 80,
        },
        png: {
          quality: 80,
        },
        webp: {
          lossless: false,
          quality: 80,
        },
        svg: {
          multipass: true,
          plugins: [
            { name: 'preset-default' },
          ],
        },
      }),
      // Gzip compression for assets
      isProduction && viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024, // Only compress files > 1kb
      }),
      // Brotli compression (better than gzip)
      isProduction && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
      }),
    ].filter(Boolean),
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
          // Additional optimizations
          passes: 2,
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
      // Code splitting for better caching and smaller bundle sizes
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split vendor chunks for better caching
            if (id.includes('node_modules')) {
              // Keep all React-related packages together to avoid multiple instances
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('react-i18next') || id.includes('react-redux') || id.includes('react-hook-form') || id.includes('react-hot-toast')) {
                return 'vendor-react';
              }
              if (id.includes('redux') || id.includes('@reduxjs')) {
                return 'vendor-redux';
              }
              if (id.includes('i18next') && !id.includes('react-i18next')) {
                return 'vendor-i18n';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide') || id.includes('icons')) {
                return 'vendor-icons';
              }
              if (id.includes('zod')) {
                return 'vendor-forms';
              }
              // Group remaining node_modules
              return 'vendor-common';
            }
          },
        },
      },
      // Target modern browsers for smaller bundle
      target: 'es2020',
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Chunk size warning limit
      chunkSizeWarningLimit: 500,
      // Disable source maps in production
      sourcemap: isProduction ? false : true,
    },
    // Optimize dependencies pre-bundling
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'react-redux'],
      exclude: ['@vite/client', '@vite/env'],
    },
    // Enable gzip compression hints
    server: {
      headers: {
        'Cache-Control': 'public, max-age=31536000',
      },
    },
  }
})
