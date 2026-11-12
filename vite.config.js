import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// During development every /api call is forwarded to the ASP.NET Core API,
// so the browser sees one origin and no CORS setup is needed.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'https://localhost:7221'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true, secure: false },
        '/uploads': { target: apiTarget, changeOrigin: true, secure: false },
      },
    },
  }
})
