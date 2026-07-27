import client from '../../db/postgres'
import * as contentsHandler from './contents'
import * as columns from '../columns'

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

export async function createUnit({ name, color, position,description, published, freeProgress, subjectId, bbCourseId }) {
    //const bbId = '123' //mock blackBoard content Id
    const evaluationName = position < 2 ? 'Prueba de Conocimientos Iniciales' : `Taller ${(position-1)}`
    const evaluationColumn = await columns.getColumnByName(bbCourseId, evaluationName)
    const evaluationId = evaluationColumn?.id
    const res = await client.query(
        `INSERT INTO unit (name, color, position, subject_id, description,
            published, free_progress, evaluation_name, evaluation_id)
        VALUES ($1, $2, $3, $4, $5,
            $6, $7, $8, $9)
        RETURNING *`,
        [ name, color || null, position, subjectId, description,
            published, freeProgress, evaluationName, evaluationId ]
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

export async function updateUnit({ id, name, color, position, description, published, freeProgress, bbCourseId }) {
    const evaluationName = position < 2 ? 'Prueba de Conocimientos Iniciales' : `Taller ${(position-1)}`
    const evaluationId = await columns.getColumnByName(bbCourseId, evaluationName)
    //const evaluationId = evaluationColumn?.id
    const res = await client.query(
        `UPDATE unit SET
            name = $1,
            color = $2,
            position = $3,
            description = $4,
            published = $5,
            free_progress = $6,
            evaluation_name = $7,
            evaluation_id = $8
        WHERE id = $9 RETURNING *`,
        [ name, color || null, position, description, published,
            freeProgress, evaluationName, evaluationId, id ]
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
