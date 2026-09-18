import { neon } from '@neondatabase/serverless';

function postgresql(env) {
    return neon(env.DATABASE_URL)
}

export default postgresql;