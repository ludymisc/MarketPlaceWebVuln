import { Hono } from 'hono'
import { dbMiddleware } from '../database/db.middleware';
import postgresql from '../database/db.connect'
import { zValidator } from '@hono/zod-validator'
import { verifyToken } from '../middleware/jwt.config';
import { authMiddleware } from '../middleware/auth.middleware';

const product = new Hono()
product.use('*', dbMiddleware)

product.post('/add-product', async(c) => {
    try {
        const authHeader = c.req.header('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({message: "invalid token"}, 401)
        }
        const token = authHeader.split(' ')[1]
        const payload = await verifyToken(token, c.env)
        const userId = payload.id || payload.payload?.id

        const body = await c.req.parseBody();

        const {name, description, price, stock} = body["name", "description", price, stock]
        const imageFile = body[image]

        if(!imageFile || typeof imageFile === 'string') {
            return c.json({message: "field image harus diisi dengan file MIME type"}, 400)
        }

        const fileExtention = imageFile.name.split('.').pop()
        const objKey = `products/${userId}-${Date.now()}.${fileExtention}`

        await c.env.MY_BUCKET.put(objKey, file.stream(), {
            httpMetadata: {
                contentType: file.type
            }
        })

        const sql = postgresql(c.env)
        const result = await sql(`
        INSERT INTO products(user_id, name, description, price, stock, image_url)
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING *`, [userId, name, description, price, stock, objKey]);

        return c.json({
            message: "Upload berhasil",
            data: result[0]
        })
    } catch (err) {
        console.error(err.message)
        return c.json({message: "add product : Internal Server Error"}, 500)
    }
})

product.get('/get-product/me', authMiddleware, async(c) => {
    try{
        const user = c.get('user')
        const myID = user.id
        const sql = postgresql(c.env)
        const data = await sql`SELECT * FROM products WHERE user_id = ${myID}`
        return c.json({message: "proses fetching sukses", data: data}, 200)
    } catch (err) {
        console.error(err)
        return c.json({message: "get product me : internal server error"}, 500)
    }
})
// //to fetch own item when take a look at your profile
// router.get('/get-product/me', AuthMiddleware, async(req, res) => {
//     try{
//         const myId = req.user.id;

//         const fetched_product = await postgresql.query(`SELECT * FROM products WHERE user_id = '${myId}'`);
//         if (fetched_product.rows.length === 0) {
//             return res.status(200).json({ message: "you dont have anything in your store", data: [] })
//         }
//         console.log(fetched_product);
//         res.status(200).json({ message: "proses fetching sukses", data: fetched_product.rows})
//     } catch (err) {
//         console.error(err.message);
//         return res.status(500).json({ message: "error when fetching items", info: err.message })
//     }
// })

product.get('/get-product/:ownerId', async(c) => {
    try{
        const oId = c.req.param('ownerId');
        const sql = postgresql(c.env);
        const fetched_product = await sql`SELECT * FROM products WHERE user_id = ${oId}`
        console.log(fetched_product)
        return c.json({message:"proses fetching sukses", data: fetched_product}, 200)
    }catch(err){
        console.error(err.message);
        return c.json({message:"internal server error"}, 500)
    }
})

// // to see other store identified by their id
// router.get('/get-product/:ownerId', async(req, res) => {
//     try{
//         const oId = req.params.ownerId;

//         const fetched_product = await postgresql.query(`SELECT * FROM products WHERE user_id = '${oId}'`);
//         if (fetched_product.rows.length === 0) {
//             return res.status(200).json({ message: "you dont have anything in your store", data: [] })
//         }
//         console.log(fetched_product);
//         res.status(200).json({ message: "proses fetching sukses", data: fetched_product.rows})
//     } catch (err) {
//         console.error(err.message);
//         return res.status(500).json({ message: "error when fetching items", info: err.message })
//     }
// })

product.post('/checkout/items/:id', authMiddleware, async(c) => {
    try{
        const user = c.get('user');
        const buyerId = user.id;
        const sql = postgresql('c.env');
        const item_id = req.param('id');
        const body = c.req.js0n();
        const quantity = body.quantity;
        const qty = parseInt(quantity);

        const productResult = await sql`SELECT * FROM products WHERE id = ${item_id}`
        const product = productResult[0]
        const buyerResult = await sql`SELECT * FROM users WHERE id = ${buyerId}`
        const buyer = buyerResult[0]
        const purchase = await sql`UPDATE users SET balance = balance - ${product.price} * ${qty} WHERE id = ${buyer.id}`
        await sql`UPDATE products SET stock = stock - ${qty} WHERE id = ${product.id}`
        await sql`UPDATE users SET balance = balance + ${product.price} * ${qty} WHERE id = ${product.user_id}`
        c.json({
            message: "pembelian berhasil",
            barang : purchase
        })
    } catch (err) {
        console.error(err.message);
        c.json({message: "internal server error"}, 500)
    }
})
// router.post('/checkout/items/:id', AuthMiddleware, async(req, res) => {
//     try{
//         const idBarang = req.params.id;
//         const buyerId = req.user.id;
//         const userBalance = req.user.balance;
//         const quantity = req.body.quantity;
//         const qty = parseInt(quantity) || 1

//         if (!idBarang || qty <= 0) {
//             return res.status(400).json({
//                 message: "id barang tidak ditemukan atau kuantitas tidak valid"
//             })
//         }

//         const productResult = await postgresql.query(`SELECT * FROM products WHERE id = $1`, [idBarang])
        
//         if (productResult.rows.length === 0) {
//             await postgresql.query('ROLLBACK')
//             return res.status(404).json({
//                 message: "Produk tidak dapat ditemukan"
//             })
//         } else if (qty > productResult.rows[0].stock) {
//             return res.status(400).json({ message: "stocknya abis lae, gaada segitu"})
//         }

//         const product = productResult.rows[0];
//         const ownerId = product.user_id;

//         if (buyerId === ownerId) {
//             return res.status(400).json({ message: "Gabole beli item sendiri bujankk" })
//         }
    
//         const buyerResult = await postgresql.query(`SELECT * FROM users WHERE id = $1`, [buyerId])

//         const buyer = buyerResult.rows[0];
//         const totalPrice = Number(product.price) * qty;

//         if (totalPrice > userBalance) {
//             res.status(400).json({ message: "Sisa uang anda tidak cukup untuk melakukan transaksi" })
//         }

//         await postgresql.query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [qty, idBarang])
//         await postgresql.query(`UPDATE users SET balance = balance - $1 WHERE id = $2`, [totalPrice, buyerId])
//         await postgresql.query(`UPDATE users SET balance = balance + $1 WHERE id = $2`, [totalPrice, ownerId])
//         return res.status(200).json({
//             message: "Pembelian berhasil!",
//             detail: {
//                 product_name: product.name,
//                 quantity: qty,
//                 total_price: totalPrice,
//                 remaining_balance: Number(buyer.balance) - totalPrice
//             }
//         });
//     } catch (err) {
//         console.error(err.message)
//         return res.status(500).json({ 
//             message: "Internal Server Error",
//             Info: err.message
//         })
//     }
// })

// router.delete('/delete-product/:id', AuthMiddleware, async(req, res) => {
//     try {
//         const productId = req.params.id;
//         const userId = req.user.id

//         const findProduct = await postgresql.query(`SELECT * FROM products WHERE id = $1`, [productId])

//         if (findProduct.rows.length === 0) {
//             return res.status(404).json({ message: "Data tidak dapat ditemukan" })
//         }

//         const product = findProduct.rows[0];

//         if (product.user_id !== userId) {
//             return res.status(403).json({ message: "Akses ditolek, anda bukan pemilik data ini" })
//         }

//         if (product.image_url) {
//             await deleteFromCloudStorage(product.image_url);
//         }

//         await postgresql.query(`DELETE FROM products WHERE id = $1`, [productId]);

//         return res.status(200).json({
//             message: "Produk dan gambar sudah dihapus",
//             deletedProductId: product
//         })
//     } catch (err) {
//         console.error(err.message)
//         return res.status(500).json({ message: "Ada masalah dengan sistem: ", info: err.message})
//     }
// })


product.get('/allProduct', async (c) => {
    try{
        let exludeUserId = null;
        const authHeader = c.req.header('Authorization')

        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1]
                const payload = await verifyToken(token, c.env)
                const exludeUserId = payload.id || payload.payload?.id
            } catch (err) {
                console.error(err.message);
                return c.json({message: "masalah pada saat verify token"}, 400 )
            }}

            const result = excludeUserId
            ? await postgresql.query`SELECT * FROM products WHERE user_id != ${excludeUserId}`
            : await postgresql.query`SELECT * FROM products`

            c.json({message: "berhasil mengambil seluruh product"}, 200)
    } catch (err) {
        console.error(err);
        c.json({message: "fetch gagal, internal server error", err: err.message}, 500)
    }
})

// router.get('/allProduct', async (req, res) => {
//     try {
//         let excludeUserId = null;
//         const authHeader = req.headers.authorization;

//         if (authHeader?.startsWith('Bearer ')) {
//             try {
//                 const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
//                 excludeUserId = decoded.id;
//             } catch (err) {
//                 console.error(err.message);
//                 res.status(500).json({ message: "cek bagian authHeader" })
//             }
//         }

//         const result = excludeUserId
//         ? await postgresql.query(`SELECT * FROM products WHERE user_id != $1`, [excludeUserId]) 
//         : await postgresql.query(`SELECT * FROM products`);

//         res.status(200).json({ message: "proses fetching sukses", data: result.rows })
//     } catch (err) {
//         console.error(err.message)
//         return res.status(500).json({ message: "fetch all error", info: err.message })
//     }
// })

// router.patch('/edit-product', async(req, res) => {
//     try {

//     } catch (err) {
        
//     }
// })


export default product