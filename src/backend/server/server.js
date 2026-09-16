import express, { Router } from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';
import authRoutes from '../API/auth.controller.js'
import productRoutes from '../API/product.controller.js'

const app = express({
    origin: 'http://localhost:5173', 
    credentials: true
});

app.use(cors());
app.use(express.json({ limit: '10mb'}));
app.use('/api', authRoutes, productRoutes)

app.listen(3000, () => {
    console.log("Server siap, gas langsung aja eksekusi")
})

app.get('/test', (req, res) => {
    res.status(200).json({ message: "test berhasil"})
})

export default app;