import { Pool } from 'pg'

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
})

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle PostgreSQL client:', err)
    process.exit(-1)
})

export default pool