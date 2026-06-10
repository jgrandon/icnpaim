import { Pool } from 'pg'

const pool = new Pool({
    user: 'postgres',
    password: 'postgresql',
    host: '127.0.0.1',
    port: 5432,
    database: 'icnpaim',
})

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle PostgreSQL client:', err)
    process.exit(-1)
})
export default pool