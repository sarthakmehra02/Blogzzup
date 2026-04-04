import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['axios', 'showdown', 'turndown', 'lucide-react']
  },
  server: {
    proxy: {
      '/api/devto': {
        target: 'https://dev.to/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/devto/, '')
      },
      '/api/hashnode': {
        target: 'https://gql.hashnode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hashnode/, '')
      },
      '/api/medium': {
        target: 'https://api.medium.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/medium/, '')
      }
    }
  },
  build: {
    cssMinify: false
  }
})
