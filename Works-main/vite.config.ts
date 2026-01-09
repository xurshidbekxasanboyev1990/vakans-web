import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // ============================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================
  build: {
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Production'da console.log olib tashlash
        drop_debugger: true,
      },
    },
    
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - alohida cache qilinadi
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'sonner', 'recharts'],
          'utils': ['zod', 'date-fns'],
        },
      },
    },
    
    // Source maps faqat development uchun
    sourcemap: false,
    
    // CSS code splitting
    cssCodeSplit: true,
  },
  
  // Optimized dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'lucide-react',
    ],
  },
  
  // Server settings
  server: {
    hmr: {
      overlay: true,
    },
  },
  
  // Preview settings
  preview: {
    port: 4173,
  },
})
