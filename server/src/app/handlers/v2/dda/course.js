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

export async function getGroups(courseId) {
    const res = await client.query(
        `SELECT
            g.pk1 AS id,
            g.group_name as name,
            u.pk1 AS user_id
        FROM group_users AS gu
        JOIN groups AS g ON gu.groups_pk1 = g.pk1
        JOIN course_users AS cu ON gu.course_users_pk1 = cu.pk1
        JOIN users AS u ON cu.users_pk1 = u.pk1
        WHERE g.crsmain_pk1 = $1;`,
        [ courseId ]
    )
    
    console.log('DDA => Course => getGroups => rows', res.rows.length)

    const groups = []
    for(let i=0; i < res.rows.length; i++) {
        const { id, name, userId } = objectToCamelCase(res.rows[i])
        if (!groups[id]) {
            groups[id] = {
                id,
                name,
                students: [ userId ]
            }
        } else groups[id].students.push(userId)
    }

    return groups
}