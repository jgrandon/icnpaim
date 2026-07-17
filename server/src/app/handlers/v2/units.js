import client from '../../db/postgres'
import * as contentsHandler from './contents'

export async function getAllUnits(subjectId) {
    const res = await client.query(
        `SELECT * FROM unit 
        WHERE enabled = TRUE 
            AND subject_id = $1
        ORDER BY position ASC`,
        [ subjectId ]
    )
    return res.rows
}

export async function getUnitById(id) {
    const res = await client.query(
        'SELECT * FROM unit WHERE id = $1',
        [ id ]
    )
    return res.rows[0] || null
}

export async function createUnit({ name, color, position,description, published, freeProgress, subjectId }) {
    const bbId = '123' //mock blackBoard content Id
    const res = await client.query(
        `INSERT INTO unit (name, color, position, bb_id, subject_id, description, published, free_progress) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [ name, color || null, position, bbId,
            subjectId, description, published, freeProgress ]
    )
    const newUnit = res.rows[0]
    if (newUnit) {
        createDefaultLR(newUnit.id)
    }
    return newUnit
}

export async function createDefaultLR(unitId) {
    const res = await client.query(
        `INSERT INTO learningrouteschema 
            (level, min_grade, max_grade, enabled, unit_id)
        VALUES 
            (1, 1.0, 4.0, TRUE, $1),
            (2, 4.0, 5.5, TRUE, $1),
            (3, 5.5, 7.0, TRUE, $1)
        RETURNING *`,
        [ unitId ]
    )
    return res.rows
}

export async function updateUnit({ id, name, color, position, description, published, freeProgress }) {
    const res = await client.query(
        `UPDATE unit SET
            name = $1,
            color = $2,
            position = $3,
            description = $4,
            published = $5,
            free_progress = $6
        WHERE id = $7 RETURNING *`,
        [ name, color || null, position, description, published, freeProgress, id ]
    )
    return res.rows[0] || null
}

export async function deleteUnit(id) {
    await contentsHandler.deleteByUnit(id)

    const res = await client.query(
        'UPDATE unit SET enabled=FALSE WHERE id = $1 RETURNING *', 
        [ id ]
    )
    return res.rows[0] || null
}
