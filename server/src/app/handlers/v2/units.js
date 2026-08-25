import client from '../../db/postgres'
import * as contentsHandler from './contents'
import * as columns from '../columns'
import unitServices from '../../../../../public/src/services/units'
import { objectToCamelCase } from '../../lib/objectToCamelCase'
import * as ddaGradesHandler from './dda/grades'

export async function getAllUnits(subjectId) {
    const res = await client.query(
        `SELECT * FROM unit 
        WHERE enabled = TRUE 
            AND subject_id = $1
        ORDER BY position ASC`,
        [ subjectId ]
    )
    const units = res.rows ?? []
    return units.map(u => objectToCamelCase(u))
}

export async function getUnitById(id) {
    const res = await client.query(
        'SELECT * FROM unit WHERE id = $1',
        [ id ]
    )
    return res.rows[0] || null
}

async function getNextPosition (subjectId) {
    const res = await client.query(
        `SELECT MAX(position)
        FROM unit
        WHERE enabled = TRUE
            AND subject_id = $1`,
        [ subjectId ]
    )
    const lastPosition = res.rows[0]?.max ?? 0
    //console.log('getNextPosition', res.rows[0])
    return lastPosition + 1
}

export async function createUnit({ name, color, description, published, freeProgress, subjectId, bbCourseId }) {
    //const bbId = '123' //mock blackBoard content Id
    const position = await getNextPosition(subjectId)
    console.log('createUnit => position', position)
    const evaluationName = getEvaluationName(position)
    const evaluationId = await getEvaluationId(evaluationName, bbCourseId)
    const res = await client.query(
        `INSERT INTO unit (name, color, position, subject_id, description,
            published, free_progress, evaluation_name, evaluation_id, expires_at)
        VALUES ($1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10)
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

export async function updateUnit({ id, name, color, position, description, published, freeProgress, bbCourseId, expiresAt }) {
    const res = await client.query(
        `UPDATE unit SET
            name = $1,
            color = $2,
            description = $3,
            published = $4,
            free_progress = $5,
            expires_at = $6
        WHERE id = $7 RETURNING *`,
        [ name, color || null, description, published,
            freeProgress, expiresAt, id ]
    )
    return res.rows[0] || null
}

function getEvaluationName (position) {
    return position < 2 ? 'Prueba de Conocimientos Iniciales' : `Taller ${(position-1)}`
}

async function getEvaluationId (evaluationName, bbCourseId) {
    let evaluationId = null
    try {
        evaluationId = await ddaGradesHandler.getGradeByName(bbCourseId, evaluationName)
    } catch(e) {
        console.log('error getting column by name', e.message)
    }
    return evaluationId
}

export async function updatePositions(units, bbCourseId) {
    try {
        let results = []
        for (let i = 0; i < units.length; i++) {
            const { id, name, color, position, description, published, freeProgress } = units[i]
            const evaluationName = getEvaluationName(position)
            const evaluationId = await getEvaluationId(evaluationName, bbCourseId)
            const res = await client.query(
                `UPDATE unit SET
                    position = $1,
                    evaluation_name = $2,
                    evaluation_id = $3
                WHERE id = $4 RETURNING *`,
                [ position, evaluationName, evaluationId, id ]
            )
            results.push(res.rows[0] || null)
        }
        return results
    } catch (e) {
        console.log('Error updating units position', e.message)
        return []
    }
}

export async function deleteUnit(unit, subjectId, bbCourseId) {
    const deletedPosition = unit.position

    await contentsHandler.deleteByUnit(unit.id)

    const deletionRes = await client.query(
        'UPDATE unit SET enabled=FALSE WHERE id = $1 RETURNING *', 
        [ unit.id ]
    )

    const higherUnitsRes = await client.query(
        `SELECT *
        FROM unit
        WHERE subject_id = $1
            AND position > $2
            AND enabled=TRUE`, 
        [ subjectId, deletedPosition ]
    )

    for (let i = 0; i < higherUnitsRes.rows.length; i++) {
        const newPosition = deletedPosition + i
        const { id } = higherUnitsRes.rows[i]
        const evaluationName = getEvaluationName(newPosition)
        const evaluationId = await getEvaluationId(evaluationName, bbCourseId)
        const updatedUnitRes = await client.query(
            `UPDATE unit SET
                position = $1,
                evaluation_name = $2,
                evaluation_id = $3
            WHERE id = $4 RETURNING *`,
            [ newPosition, evaluationName, evaluationId, id ]
        )
    }
    return deletionRes.rows[0] || null
}
