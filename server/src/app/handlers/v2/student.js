import client from '../../db/postgres'
import { objectToCamelCase } from '../../lib/objectToCamelCase'

export async function getStudentByBBid(bbId) {
    const res = await client.query(
        `SELECT * FROM student WHERE bb_id = $1`,
        [ bbId ]
    )
    const student = res.rows[0]
    if (!student) return null
    return { ...student, bbId }
}

export async function getOrCreate (data) {
    let student = await getStudentByBBid(data.bbId)
    if (!student) {
        student = await createStudent(data)
    }
    return student
}

export async function createStudent ({
    name,
    bbId
}) {
    const res = await client.query(
        `INSERT INTO student (name, bb_id) 
        VALUES ($1, $2)
        RETURNING *`,
        [ name, bbId ]
    )
    const student = res.rows[0]
    return { ...student, bbId }
}

export async function getStudentsResults (subjectId) {
    const res = await client.query(
        `SELECT
            s.id,
            s.name,
            s.bb_id,
            u.id AS unit_id,
            COUNT(*) AS progress
        FROM student AS s
        LEFT JOIN (
            SELECT * FROM progress WHERE completed = TRUE
        ) AS p ON s.id = p.student_id
        JOIN content AS c ON p.content_id = c.id
        JOIN unit AS u ON c.unit_id = u.id
        WHERE u.enabled = TRUE
            AND u.published = TRUE
            AND u.subject_id = $1
        GROUP BY s.id, u.id`,
        [ subjectId ]
    )
    const data = (res.rows || []).map(d => objectToCamelCase(d))
    let students = []

    //TODO: replace reduce with a for
    for(let i=0; i < data.length; i++) {
        const current = data[i]
        const { id, name, unitId, progress, bbId } = current
        const unit = {
            id: unitId,
            progress
        }
        let existing = students.find(s => s.id = id)
        if (!existing) {
            students.push({
                id,
                name,
                bbId,
                units: { [unitId] : unit } })
        } else {
            existing.units[unitId] = unit
        }
    }
    return students
    
}