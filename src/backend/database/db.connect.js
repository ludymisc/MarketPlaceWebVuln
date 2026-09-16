import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '../../../.env'});

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL?.split('?')[0];

const postgresql = new Pool({
    connectionString: connectionString,
    ssl: true
});

export default postgresql;