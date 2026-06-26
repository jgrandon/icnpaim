import client from '../../db/postgres'

const __DEFAULT_MIN_GRADE = 1
const __DEFAULT_MAX_GRADE = 7
/*
export async function createLearningRoutes(unitId, breakPoints) {
    const newRows = []
    for (let i = 0; i == breakPoints.length; i++) {
        const currentBP = breakPoints[i]
        const prevBP = breakPoints[i-1]
        const isFirst = i == 0
        const isLast = i == breakPoints.length
        let minGrade, maxGrade

        if (isFirst) {
            minGrade = __DEFAULT_MIN_GRADE
            maxGrade = currentBP
        }
        if (isLast) {
            minGrade = prevBP
            maxGrade = __DEFAULT_MAX_GRADE
        }
        if (!isFirst && !isLast) { //middle position
            minGrade = prevBP
            maxGrade = currentBP
        }
        const level = i+1

        const res = await client.query(
            'INSERT INTO learningrouteschema (level, min_grade, max_grade, unit_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [ level, minGrade, maxGrade, unitId ]
        )
        newRows.add(res.rows[0])
    }
    return newRows
}
*/
export async function updateSchema (unitId, data) {
    disableHigerLevels(data.length)
    const dbUpdate = data.map(async (learningRoute) => {
        const { level, minGrade, maxGrade } = learningRoute

        const res = await client.query(
            `INSERT INTO learningrouteschema (level, min_grade, max_grade, unit_id, enabled) 
            VALUES ( $1, $2, $3, $4, TRUE ) 
            ON CONFLICT (level, unit_id)
            DO UPDATE SET
                min_grade = $2,
                max_grade = $3,
                enabled = TRUE
            RETURNING *`,
            [ level, minGrade, maxGrade, unitId ]
        )
        return res.rows[0]
    })

    return dbUpdate
}

export async function disableHigerLevels (unitId, maxLevel) {
    const res = await client.query(`UPDATE learningrouteschema SET enabled = FALSE  WHERE unit_id = $1 AND level > $2 RETURNING *`,
        [ unitId, maxLevel ]
    )
    return res.rows
}

/*
export async function createLearningRoute ({ level, minGrade, maxGrade, unitId }) {
    const res = await client.query(
        'INSERT INTO learningrouteschema (level, min_grade, max_grade, unit_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [ level, minGrade, maxGrade, unitId ]
    )
    return res.rows[0]
}

export async function updateLearningRoute ({ level, minGrade, maxGrade, unitId }) {
    const res = await client.query(
        `UPDATE learningrouteschema SET (
            level = $1,
            min_grade = $2,
            max_grade = $3
        ) WHERE unit_id = $4 RETURNING *`,
        [ level, minGrade, maxGrade, unitId ]
    )
    return res.rows[0]
}

export async function getByUnitId(level, unitId) {
    const res = await client.query('SELECT * FROM learningrouteschema WHERE unit_id=$1', [ unitId ])
    return res.rows
}

*/

/*
export async function getAllContents(unitId) {
    const res = await client.query('SELECT * FROM content WHERE unit_id=$1', [ unitId ])
    return res.rows
}

export async function updateContent({ id, title, type, url, unitId }) {
    const res = await client.query(
        `UPDATE content SET 
        title = $1,
        type = $2,
        url = $3
        unit_id = $4
        WHERE id = $5 RETURNING *`,
        [ title, type || 'Contenido', url, unitId, id ]
    )
    return res.rows[0] || null
}

export async function deleteContent(id) {
    const res = await client.query(
        'DELETE FROM content WHERE id = $1 RETURNING *', 
        [ id ]
    )
    return res.rows[0] || null
}

export async function deleteByUnit(unitId) {
    const res = await client.query(
        'DELETE FROM content WHERE unit_id = $1 RETURNING *', 
        [ unitId ]
    )
    return res.rows || null
}
*/