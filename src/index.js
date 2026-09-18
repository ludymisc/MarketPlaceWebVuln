import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './backend/API/auth.controller.js'
import testRoutes from './backend/API/test.controller.js'

const app = new Hono()

app.use('*', cors())

// Gabungkan cabang route di sini
app.route('/auth', authRoutes)   // Endpoint jadi: /auth/login, /auth/register
app.route('/test', testRoutes)  

export default app