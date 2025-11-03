import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/test-html', // 或者你的仓库名称
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  // 环境变量配置
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
  }
})