import { Router } from 'express'
import 'dotenv/config'
import '../database/db.connect.js'
import postgresql from '../database/db.connect.js';
import jwt from 'jsonwebtoken';
import AuthMiddleware from '../middleware/auth.middleware.js';
import 'dotenv/config'
import multer from 'multer'
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from '../database/r2.storage.js';

const router = Router();
const multer__ = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

router.post('/register', async(req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password) {
            res.status(400).json("email dan password harap diisi")
            return console.log("email atau password masih kosong tapi udah di submit")
        }

        const email_checker = await postgresql.query(`SELECT * FROM users WHERE email = '${email}'`);

        if (email_checker.rows.length > 0) {
            res.status(400).json({ message: "email sudah terdaftar!"});
            return;
        }

        await postgresql.query(`INSERT INTO users (email, password)
            VALUES ('${email}', '${password}') RETURNING *`)

        res.status(201).json({ 
            message: "sukses, data berhasil di kirim",
            data : {email}
        })
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: "database error", error: err.message})
    }
})

router.post('/login', async(req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password) {
            res.status(400).json("email dan password harus diisi")
            return
        }

        const userResult = await postgresql.query(`SELECT * FROM users WHERE email = '${email}'`);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Email tidak ditemukan!" });
        }

        const user = userResult.rows[0];

        if (user.password !== password) {
            return res.status(401).json({ message: "Password salah!" });
        }

        const token = jwt.sign(
            {
            id: user.id,
            email: user.email, 
            name: user.name, 
            password: user.password, 
            balance: user.balance, 
            phone: user.phone,
            address: user.address,
            role: user.role },
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        )

        return res.status(200).json({ message: "Login berhasil!", token: token });
    } catch(err) {
        res.status(500).json({ messagge: "Internal Server Error" });
    }
})

router.patch('/forget-password', async(req, res) => {
    try{
        const {email, password } = req.body;
        if(!email || !password) {
            res.status(400).json("email dan password harus diisi")
            return
        }

        const userResult = await postgresql.query(`SELECT * FROM users WHERE email = '${email}'`);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Email tidak ditemukan!" });
        }

        const updateData = await postgresql.query(`UPDATE users SET password = '${password}' WHERE email = '${email}'`)

        const updatedUser = updateData.rows[0];

        return res.status(200).json({ message: "Password berhasil diganti, silahkan login kembali.", updatedUser });
    } catch(err) {
        res.status(500).json({ messagge: "Internal Server Error" });
    }
})

router.patch('/update-profile', AuthMiddleware, async (req, res) => {
    try {
        const {name, address, phone} = req.body;
        const userEmail = req.user.email;

        if(!name || !address || !phone ) {
            res.status(400).json({ message: "harap lengkapi data diri"});
            return;
        }

        const updateProfile = await postgresql.query(`
            UPDATE users 
            SET name = '${name}', address = '${address}', phone = '${phone}'
            WHERE email = '${userEmail}'`);
        
        return res.status(200).json({
            success: true,
            message: "info akun telah diperbarui",
            data: updateProfile.rows[0]})
    } catch(err) {
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error", 
            info: err.message });
        console.log(err);
    }
})

router.post('/upload-avatar', AuthMiddleware, multer__.single('user-avatar'), async (req, res) => {
    try {
        const avatarFile = req.file;

        if (!avatarFile) {
            return res.status(400).json({ message: "file is required, please insert a PNG or JPG" })
        }

        const fileName = `${Date.now()}-${avatarFile.originalname}`
        const pathDir = `user-avatar/${fileName}`

        await s3.send(
            new PutObjectCommand({
                Bucket: "market-place-vuln",
                Key: pathDir,
                Body: avatarFile.buffer,
                ContentType: avatarFile.mimetype,
            }),
        );

        const fileUrl = `${process.env.PUBLIC_URL}/${pathDir}`
        await postgresql.query(`UPDATE users SET avatar_url = '${fileUrl}' WHERE email = '${req.user.email}'`)

        return res.status(200).json({
            message: "Upload avatar sukses!",
            fileName: fileName,
            file_url: fileUrl
        });

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: err.message})
    }
})

router.get('/me', AuthMiddleware, async(req, res) => {
    try {
        const uid = req.user.id;
        const myData = await postgresql.query(`SELECT id, email, name, balance, avatar_url FROM users WHERE id = ${uid}`)
        if (myData.rows.length === 0) {
            return res.status(404).json({ message: "mungkin anda belum login" })
        }
        const resultData = myData.rows[0]

        console.log(resultData)
        return res.status(200).json({ message: "here is your data", data: resultData})
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Internal Server Error", Info: err.message })
    }
})

router.get('/get-user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await postgresql.query(
            `SELECT id, name, avatar_url FROM users WHERE id = $1`, [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });
        return res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Failed to Fetch User ID", info: err.message})
    }
});

export default router