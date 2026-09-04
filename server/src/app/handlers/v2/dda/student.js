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

export async function getStudentsInCourse(courseId) {
        const res = await client.query(
        `SELECT
            u.pk1 as bb_id,
            u.firstname || ' ' || u.lastname as name
        FROM users AS u 
        JOIN course_users AS cu ON cu.users_pk1 = u.pk1
        JOIN group_users AS gu ON gu.course_users_pk1 = cu.pk1
        JOIN groups AS g ON gu.groups_pk1 = g.pk1
        WHERE g.crsmain_pk1 = $1
        GROUP BY u.pk1`,
        [ courseId ]
    )
    const students = res.rows.map(s => objectToCamelCase(s))
    return students

}
