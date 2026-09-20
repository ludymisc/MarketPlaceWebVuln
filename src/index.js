import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './backend/API/auth.controller.js'
import productRoutes from './backend/API/product.controller.js'
import testRoutes from './backend/API/test.controller.js'

const app = new Hono()

app.use('*', cors())
app.use('*', async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`)
  await next()
})

app.route('/auth', authRoutes) 
app.route('/product', productRoutes)
app.route('/test', testRoutes)  


export default app