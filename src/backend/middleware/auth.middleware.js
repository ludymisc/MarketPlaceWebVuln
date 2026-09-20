import { verify } from "hono/jwt";
import { createMiddleware } from 'hono/factory'

export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({message: "token invalid"}, 400)
    }

    const token = authHeader.split(' ')[1]

    try {
        const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
        c.set('user', payload)

        await next()
    } catch (err) {
        console.error("JWT Error:", err.message)
        return c.json({message: "Unauthorized"}, 401)
    }
})
