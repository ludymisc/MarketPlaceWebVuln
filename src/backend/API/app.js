import express from 'express';
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


export default app;