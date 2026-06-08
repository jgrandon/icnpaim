import { Client } from 'pg'

const client = new Client({
    user: 'postgres',
    password: 'postgresql',
    host: '127.0.0.1',
    port: 5432,
    database: 'icnpaim',
})

export default client