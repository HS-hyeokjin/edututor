import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.edututor.site',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')  
      },
      '/ws': {
        target: 'wss://www.edututor.site', 
        ws: true,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ws/, '')
      }
    }
  },
  define: {
    'global': {}
  }
});
