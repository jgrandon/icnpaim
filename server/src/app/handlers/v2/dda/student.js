import client from '../../../db/dda'
import { objectToCamelCase } from '../../../lib/objectToCamelCase'

export async function getBBid(externalId) {
    const res = await client.query(
        `SELECT pk1 AS id FROM users WHERE user_id = $1`,
        [ externalId ]
    )
    const student = res.rows[0]
    return student?.id 
}
