import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core vendor libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }

          // Supabase client
          if (id.includes('node_modules/@supabase/supabase-js')) {
            return 'supabase';
          }

          // Icons library
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }

          // Stripe
          if (id.includes('node_modules/@stripe/stripe-js')) {
            return 'stripe';
          }

          // Admin pages and components - separate chunk loaded on demand
          if (id.includes('/src/pages/AdminNew') ||
              id.includes('/src/components/admin/')) {
            return 'admin';
          }

          // Shop-related code
          if (id.includes('/src/pages/Shop') ||
              id.includes('/src/pages/ProductDetail') ||
              id.includes('/src/pages/Checkout')) {
            return 'shop';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
