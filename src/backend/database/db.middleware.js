import postgresql from './db.connect.js'

export const dbMiddleware = async (c, next) => {
    c.set('sql', postgresql(c.env))
    await next();
}