import dotenv from 'dotenv'
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import postgresql from './db.connect.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '../../../.env'})
console.log(process.env.DATABASE_URL)
async function DATABASE_RESET() {
    try {
        const jsonPath = path.resolve(__dirname, './seeds.json');
        const rawData = await fs.readFile(jsonPath, 'utf-8');
        const seedUsers = JSON.parse(rawData);

        console.log("PEMBERSIHAN DIMULAI DALAM 3 DETIK");
        console.log("PROGRES : [0/3]")
        console.log("MENGHAPUS DATABASE....")

        const nukeTabel = await postgresql.query(
            `
            DROP TABLE IF EXISTS users CASCADE;    
            DROP TABLE IF EXISTS products CASCADE;    
            DROP TABLE IF EXISTS log CASCADE;    
            DROP TABLE IF EXISTS category CASCADE;    
            `
        )

        console.log(nukeTabel)
        console.log("TABEL BERHASIL DIHAPUS")
        console.log("PROGRES : [1/3]")
        console.log("MEMBUAT ULANG TABEL")

        const restoreData = await postgresql.query(
            `
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance INTEGER DEFAULT '1000',
        phone VARCHAR(20),
        address TEXT,
        avatar_url TEXT DEFAULT 'https://pub-r2-link.com/default-avatar.png',
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

        CREATE TABLE IF NOT EXISTS products(
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(150) NOT NULL,
            description TEXT,
            price NUMERIC(10, 2) NOT NULL,
            stock INT DEFAULT 0,
            image_url TEXT
        )
      `)
    
        console.log(restoreData)
        console.log("TABEL BERHASIL DIBUAT")
        console.log("PROGRES : [2/3]")
        console.log("RESTORASI DATA")

        const dataRestoraion = await postgresql.query(`
        INSERT INTO users (name, email, password, phone, address, role)
        SELECT name, email, password, phone, address, role
        FROM json_populate_recordset(NULL::users, $1)
        `, [JSON.stringify(seedUsers)]);

        console.log(dataRestoraion);
        console.log("Data ter-retorasi");
        console.log("PROGRES : [3/3]");
        console.log("RESET SELESAI.")
    } catch(err) {
        console.error(err);
    }
}
async function test() {
    try {
        console.log("TEST DIMULAI DALAM 3 DETIK");
        console.log("PROGRES : [0/3]")
        console.log("TESTING DATABASE....")

        const user = await postgresql.query(`SELECT * FROM users`)
        console.log(user);
        console.log("TEST SELESAI.")
    } catch(err) {
        console.error(err);
    }
}

test()
