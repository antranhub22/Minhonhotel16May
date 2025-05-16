import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
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