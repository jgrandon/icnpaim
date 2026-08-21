import client from '../../../db/dda'
import { objectToCamelCase } from '../../../lib/objectToCamelCase'

export async function getBBid(externalId) {
    const res = await client.query(
        `SELECT pk1 AS id FROM course_main WHERE course_id = $1`,
        [ externalId ]
    )
    const course = res.rows[0]
    return course?.id 
}
