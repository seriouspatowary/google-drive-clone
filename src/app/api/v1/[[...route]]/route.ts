import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import fileRoute from '../_routes/file.route'

export const runtime = 'nodejs'

const app = new Hono().basePath('/api/v1')

app.route("/files", fileRoute)

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello Next.js!',
  })
})

export const GET = handle(app)
export const POST = handle(app)