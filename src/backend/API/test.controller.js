import { Hono } from 'hono'
import postgresql from '../database/db.connect.js'

const test = new Hono()

test.get('/ping', (c) => c.text('Hono!'))

test.get('/test-r2', async (c) => {
    try {
        const list = await c.env.MY_BUCKET.list({
            prefix: 'user-avatar/'
        })

        const files = list.objects
            .map((obj) => obj.key)
            .filter((key) => key !== "user-avatar/"); // Disesuaikan dengan Prefix kamu "user-avatar/"

        console.log("Avatar Files:", files);

        // 4. Return respon JSON ke client
        return c.json({
            success: true,
            total: files.length,
            files: files
        });

    } catch (err) {
        console.error("R2 Error:", err);
        return c.json({ 
            success: false, 
            message: err.message 
        }, 500);
    }
});

test.get('/allProduct', async (c) => {
    try {
        const id_item = 5;
        const sql = postgresql(c.env);
        const items = await sql`SELECT id, user_id, name, price FROM products where id = ${id_item}`
        return c.json(items)
    } catch (err) {
        console.error(err)
        return c.json({message: "allProduct Route fallback: internal server error" }, 500)
    }
})

test.post('/register', async(c) => {
    try {
        const {email, password} = await c.req.json()
        return c.json({email, password});
    } catch (err) {
        console.error(err);
        return c.json({message: "register error : Internal Server Error"}, 500)
    }
})


// app.get('/allProduct', async (c) => {
//         const sql = postgresql(c.env);
//         const items = await sql`SELECT * FROM products`
//         return c.json(items);
// })

export default test