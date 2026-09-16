import { Router } from 'express'
import 'dotenv/config'
import '../database/db.connect.js'
import postgresql from '../database/db.connect.js';
import AuthMiddleware from '../middleware/auth.middleware.js';
import 'dotenv/config'
import multer from 'multer'
import { 
    DeleteBucketCommand, 
    PutObjectCommand 
} from "@aws-sdk/client-s3";
import { s3 } from '../database/r2.storage.js';
import jwt from 'jsonwebtoken'

const router = Router();
const multer__ = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

async function uploadToCloudStorage(file) {
    const fileExtension = file.originalname;
    const fileName = `products/${Date.now()}-${fileExtension}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: "market-place-vuln",
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        }),
    );
    
    const publicDomain = `${process.env.PUBLIC_URL}/${fileName}`;
    return publicDomain;
}

async function deleteFromCloudStorage(imageUrl) {
    if (!imageUrl) {
        return;
    }

    try {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts.slice(-2).join('/');
    
        await s3.send(
            new DeleteBucketCommand({
                 bucket: "market-place-vuln",
                 key: fileName,
            })
        );
        console.log("Gambar berhasil dihapus dari Cloud Storage:", fileName);
    } catch (err) {
        console.error("Terjadi error pada kode :", err.message)
        
    }

}

router.post('/add-product', AuthMiddleware, multer__.single('img'), async(req, res) => {
    try {
        const {name, description, price, stock} = req.body;
        const image = req.file;
        const userId = req.user.id;

        if (!name || !price) {
            return res.status(400).json({ message: "nama dan harga produk wajib diisi"})
        }

        let imageUrl = null;
        
        if (image) {
            imageUrl = await uploadToCloudStorage(image);
            console.log("Gambar berhasil di upload ke storage", imageUrl);
        }

        const result = await postgresql.query(`INSERT INTO products(user_id, name, description, price, stock, image_url) 
            VALUES($1, $2, $3, $4, $5, $6) RETURNING *`, [
                userId, name, description, price, stock, imageUrl
            ]);

        return res.status(201).json({ 
            message: "barang sukses ditambahkan",
            data: result.rows[0]});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            message: "Internal Server Error",
            info: err.message })
    }
})

router.delete('/delete-product/:id', AuthMiddleware, async(req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user.id

        const findProduct = await postgresql.query(`SELECT * FROM products WHERE id = $1`, [productId])

        if (findProduct.rows.length === 0) {
            return res.status(404).json({ message: "Data tidak dapat ditemukan" })
        }

        const product = findProduct.rows[0];

        if (product.user_id !== userId) {
            return res.status(403).json({ message: "Akses ditolek, anda bukan pemilik data ini" })
        }

        if (product.image_url) {
            await deleteFromCloudStorage(product.image_url);
        }

        await postgresql.query(`DELETE FROM products WHERE id = $1`, [productId]);

        return res.status(200).json({
            message: "Produk dan gambar sudah dihapus",
            deletedProductId: product
        })
    } catch (err) {
        console.error(err.message)
        return res.status(500).json({ message: "Ada masalah dengan sistem: ", info: err.message})
    }
})

//to fetch own item when take a look at your profile
router.get('/get-product/me', AuthMiddleware, async(req, res) => {
    try{
        const myId = req.user.id;

        const fetched_product = await postgresql.query(`SELECT * FROM products WHERE user_id = '${myId}'`);
        if (fetched_product.rows.length === 0) {
            return res.status(200).json({ message: "you dont have anything in your store", data: [] })
        }
        console.log(fetched_product);
        res.status(200).json({ message: "proses fetching sukses", data: fetched_product.rows})
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: "error when fetching items", info: err.message })
    }
})
// to see other store identified by their id
router.get('/get-product/:ownerId', async(req, res) => {
    try{
        const oId = req.params.ownerId;

        const fetched_product = await postgresql.query(`SELECT * FROM products WHERE user_id = '${oId}'`);
        if (fetched_product.rows.length === 0) {
            return res.status(200).json({ message: "you dont have anything in your store", data: [] })
        }
        console.log(fetched_product);
        res.status(200).json({ message: "proses fetching sukses", data: fetched_product.rows})
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: "error when fetching items", info: err.message })
    }
})

router.post('/checkout/items/:id', AuthMiddleware, async(req, res) => {
    try{
        const idBarang = req.params.id;
        const buyerId = req.user.id;
        const userBalance = req.user.balance;
        const quantity = req.body.quantity;
        const qty = parseInt(quantity) || 1

        if (!idBarang || qty <= 0) {
            return res.status(400).json({
                message: "id barang tidak ditemukan atau kuantitas tidak valid"
            })
        }

        const productResult = await postgresql.query(`SELECT * FROM products WHERE id = $1`, [idBarang])
        
        if (productResult.rows.length === 0) {
            await postgresql.query('ROLLBACK')
            return res.status(404).json({
                message: "Produk tidak dapat ditemukan"
            })
        } else if (qty > productResult.rows[0].stock) {
            return res.status(400).json({ message: "stocknya abis lae, gaada segitu"})
        }

        const product = productResult.rows[0];
        const ownerId = product.user_id;

        if (buyerId === ownerId) {
            return res.status(400).json({ message: "Gabole beli item sendiri bujankk" })
        }
    
        const buyerResult = await postgresql.query(`SELECT * FROM users WHERE id = $1`, [buyerId])

        const buyer = buyerResult.rows[0];
        const totalPrice = Number(product.price) * qty;

        if (totalPrice > userBalance) {
            res.status(400).json({ message: "Sisa uang anda tidak cukup untuk melakukan transaksi" })
        }

        await postgresql.query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [qty, idBarang])
        await postgresql.query(`UPDATE users SET balance = balance - $1 WHERE id = $2`, [totalPrice, buyerId])
        await postgresql.query(`UPDATE users SET balance = balance + $1 WHERE id = $2`, [totalPrice, ownerId])
        return res.status(200).json({
            message: "Pembelian berhasil!",
            detail: {
                product_name: product.name,
                quantity: qty,
                total_price: totalPrice,
                remaining_balance: Number(buyer.balance) - totalPrice
            }
        });
    } catch (err) {
        console.error(err.message)
        return res.status(500).json({ 
            message: "Internal Server Error",
            Info: err.message
        })
    }
})

router.get('/allProduct', async (req, res) => {
    try {
        let excludeUserId = null;
        const authHeader = req.headers.authorization;

        if (authHeader?.startsWith('Bearer ')) {
            try {
                const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
                excludeUserId = decoded.id;
            } catch (err) {
                console.error(err.message);
                res.status(500).json({ message: "cek bagian authHeader" })
            }
        }

        const result = excludeUserId
        ? await postgresql.query(`SELECT * FROM products WHERE user_id != $1`, [excludeUserId]) 
        : await postgresql.query(`SELECT * FROM products`);

        res.status(200).json({ message: "proses fetching sukses", data: result.rows })
    } catch (err) {
        console.error(err.message)
        return res.status(500).json({ message: "fetch all error", info: err.message })
    }
})

router.patch('/edit-product', async(req, res) => {
    try {

    } catch (err) {
        
    }
})


export default router