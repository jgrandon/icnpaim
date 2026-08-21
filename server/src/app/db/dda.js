import { Pool } from 'pg'

const pool = new Pool({
    user: process.env.BLACKBOARD_DDA_USER,
    password: process.env.BLACKBOARD_DDA_PASSWORD,
    host: process.env.BLACKBOARD_DDA_HOST,
    port: process.env.BLACKBOARD_DDA_PORT,
    database: process.env.BLACKBOARD_DDA_DB,
    ssl: process.env.NODE_ENV == 'development'
        ? false 
        : { rejectUnauthorized: false }
})

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle PostgreSQL BLACKBOARD_DDA client:', err)
    process.exit(-1)
})

export default pool