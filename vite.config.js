import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Blogzzup/',
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
      '/api/tumblr': {
        target: 'https://api.tumblr.com/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tumblr/, '')
      }
    }
  }
})
