import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'nodejs'

const app = new Hono().basePath('/api/v1')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello Next.js!',
  })
})

export const GET = handle(app)
export const POST = handle(app)