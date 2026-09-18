import { Hono } from 'hono'
import { dbMiddleware } from '../database/db.middleware';
import postgresql from '../database/db.connect'
import { zValidator } from '@hono/zod-validator'
import registerSchema from '../middleware/regex.middleware';
import { generateToken, verifyToken } from '../middleware/auth.middleware';

const auth = new Hono();
auth.use('*', dbMiddleware);

auth.get('/allUsers', async(c) => {
    const sql = postgresql(c.env);
    const users = await sql`SELECT email, password FROM users`
    return c.json(users)
}) 

auth.post('/register', zValidator('json', registerSchema), async(c) => {
    try {
        const {email, password} = await c.req.json()
        if (!email || !password) {
            return c.json({message: "email dan password harus diisi"}, 400)
        }
        const sql = postgresql(c.env);
        const checkUser = await sql`SELECT * FROM users WHERE email = ${email}`
        if (checkUser.length > 0) {
            return c.json({ message: "email sudah terdaftar di database"}, 403)
        }
        //kurang regex untuk validasi input email dan password dari user.
        await sql`INSERT INTO users (email, password) VALUES (${email}, ${password})`

        return c.json({message : "input berhasil", data :(email, password)}, 201);
    } catch (err) {
        console.error(err.message);
        return c.json({message: "register error : Internal Server Error"}, 500)
    }
})

auth.post('/login', async(c) => {
    try {
        const {email, password} = await c.req.json()
        const sql = postgresql(c.env)
        const checkUser = await sql`SELECT id, email, password FROM users WHERE email = ${email}`
        if (checkUser.length === 0) {
            return c.json({message: "Email tidak dapat ditemukan"}, 404)
        }
        
        const user = checkUser[0]

        if (user.password != password) {
            return c.json({ message: "password salah"}, 401)
        }
        
        const token = await generateToken({ id: user.id, email: user.email, password: user.password}, c.env)

        return c.json({
            message: "login berhasil",
            token: token
        })
    } catch (err) {
        console.error(err.message)
        return c.json({message: "Loing error : internal server cause"}, 500)
    }
})

auth.patch('/forget-password', async(c) => {
    try{
        const {email, password} = await c.req.json()
        const sql = postgresql(c.env)
        if (!email || !password) {
            return c.json({message: "email dan password wajib diisi"})
        }

        const emailCheck = await sql`SELECT email, password FROM users WHERE email = ${email}`
        if (emailCheck.lenngth === 0) {
            return c.json({message: "email salah"})
        }

        const updateData = await sql`UPDATE users SET password = ${password} WHERE email = ${email}`

        const result = updateData[0]

        return c.json({ message: "password berhasil diganti, silahkan login kembali", result})
        
    } catch(err) { 
        console.error(err.message);
        return c.json({
            message: "forgot password error: internal server error"
        }, 500)
    }
})

auth.patch('/update-profile', async(c) => {
    try {
        const {name, address, phone} = await c.req.json();
        const sql = postgresql(c.env)
        const authHeader = c.req.header('Authorization') 
        
        
        if(!name || !address || !phone) {
            return c.json({ message: "semua field wajib diisi"}, 400)
        }
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ message: 'Token undefined' }, 401)
        }
        const token = authHeader.split(' ')[1]

        const payload = await verifyToken(token, c.env)
        const userId = payload.id || payload.payload?.id;

        if(!userId) {
            return c.json({ message: "Id user tidak valid"})
        }

        const updatedUser = await sql`UPDATE users SET name = ${name}, address = ${address}, phone = ${phone}
        WHERE id = ${userId} RETURNING email, name, address, phone`

        if (updatedUser.length === 0) {
            return c.json({ message: "User Tidak ditemukan"}, 404)
        }

        return c.json({ message: "berhasil mengubah data pengguna"}, 200);
    } catch (err) {
        console.error(err.message);
        return c.json({ message: "update profile error: Internal server Error"}, 500)
    }
})

auth.post('/upload-avatar', async(c) => {
    try{
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ message: "token undefined" }, 401)
        }
        const token = authHeader.split(' ')[1]
        const payload = await verifyToken(token, c.env)
        const userId = payload.id || payload.payload?.id

        const body = await c.req.parseBody()
        const file = body['image'];

        if (!file) {
            return c.json({ message: "file gambar null/undefined"}, 400)
        }

        const fileExtention = file.name.split('.').pop()
        const objKey = `user-avatar/${userId}-${Date.now()}.${fileExtention}`

        await c.env.MY_BUCKET.put(objKey, file.stream(), {
            httpMetadata: {
                contentType: file.type
            }
        })

        const sql = postgresql(c.env)
        await sql`
        UPDATE users
        SET avatar_url = ${objKey}
        WHERE id = ${userId}`

        return c.json({
            message: "upload avaggtgar berhasil",
            fileKey: objKey
        }, 200)
    } catch (err) {
        console.error(err.message);
        return c.json({ message: "Upload avater error : Internal Server Error"}, 500)
    }
})

auth.get('/me', async(c) => {
    try{
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({message: "invalid token"})
        }
        const token = authHeader.split(' ')[1]
        const payload = await verifyToken(token, c.env)
        const userId = payload.id || payload.payload?.id

        const sql = postgresql(c.env)

        const me = await sql`SELECT * FROM users WHERE id = ${userId}`
        return c.json({message: "get me berhasil", data: me[0]}, 200)
    } catch (err) {
        console.error(err.message);
        return c.json({ message: "get me errro : internal server error"}, 500)
    }
})

export default auth