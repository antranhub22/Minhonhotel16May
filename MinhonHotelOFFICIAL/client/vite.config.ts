import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@assets': path.resolve(__dirname, '../attached_assets')
    }
  },
  // Các plugin Vite khác nếu có
  build: {
    rollupOptions: {
      plugins: [
        visualizer({
          filename: '../dist/bundle-report.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        })
      ]
    }
  }
}); 