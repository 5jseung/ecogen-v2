import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function localApiPlugin() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/generate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'POST only' }))
          return
        }

        const chunks = []
        for await (const chunk of req) chunks.push(chunk)

        let body = {}
        try {
          const raw = Buffer.concat(chunks).toString('utf8')
          body = raw ? JSON.parse(raw) : {}
        } catch {
          res.statusCode = 400
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'Invalid JSON body' }))
          return
        }

        const { default: handler } = await server.ssrLoadModule('/api/generate.js')
        const apiRes = {
          status(code) {
            res.statusCode = code
            return apiRes
          },
          json(payload) {
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify(payload))
          },
          send(payload) {
            if (typeof payload === 'object') {
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify(payload))
              return
            }
            res.end(payload)
          },
        }

        await handler({ method: req.method, body }, apiRes)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (!process.env.GEMINI_API_KEY && env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
  }

  return {
    plugins: [react(), localApiPlugin()],
    server: {
      port: 5173,
      open: true,
    },
  }
})
