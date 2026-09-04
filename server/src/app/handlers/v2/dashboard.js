import client from '../../db/postgres'
import { objectToCamelCase } from '../../lib/objectToCamelCase'

export async function getUnitsWithCards(courseId = '1', studentId) {
    const res = await client.query(
        `SELECT
            u.*,
            c.id as content_id,
            c.title,
            c.type,
            c.url,
            c.bb_content_id,
            p.completed
        FROM unit AS u
        FULL OUTER JOIN content AS c
            ON c.unit_id = u.id
        LEFT JOIN (
            SELECT * FROM progress WHERE student_id = $1
        ) AS p
            ON p.content_id = c.id
        WHERE u.subject_id = $2
            AND u.enabled = TRUE
            AND u.published = TRUE
        ORDER BY u.position, c.id; `,
        [ studentId, courseId ]
    )
    
    console.log('getUnitsWithCards => rows', res.rows.length)

    let units = []

    for (let i=0; i < res.rows.length; i++) {
        
        const row = objectToCamelCase(res.rows[i])
        console.log('getUnitsWithCards => for ', {i, row})
        const { id, name, color, position,
            contentId, bbContentId, title, type, url, completed,
            description, freeProgress,
            evaluationId, expiresAt } = row

        const content = { id: contentId,
            title, type, url, completed, contentId: bbContentId }
        const unit = { id, name, description, color, position, freeProgress, evaluationId, expiresAt}

        const inArray = units.find(u => row.id==u.id )
        if (!inArray) {
            console.log('getUnitsWithCards => new ')

            units.push({ ...unit,
                cards: content.id ? [ content ] : [] })
            continue
        }
        console.log('getUnitsWithCards => inArray ')

        units = units.map(u => unit.id==u.id
            ? { ...u, cards: [ ...u.cards, content ]} // add content
            : u ) // bypass
    }
    return units
}