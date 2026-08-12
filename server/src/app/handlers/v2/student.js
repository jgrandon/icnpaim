import { map } from 'lodash'
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
    await registerStudentInSubject(student, data.subject)
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

export async function registerStudentInSubject (student, subject) {
    const res = await client.query(
        `INSERT INTO subject_student (student_id, subject_id)
            VALUES ( $1, $2 )
            ON CONFLICT (student_id, subject_id)
            DO UPDATE SET
                last_access = CURRENT_DATE
            RETURNING *`,
        [ student.id, subject.id ]
    )
    return res.rows[0]
}

export async function getStudentsResults (subjectId) {
    try {
        const students = await getStudentsInSubject(subjectId)
        const progress = await getProgressByStudent(subjectId)

        return students.map(s => {
            const units = progress.filter(p => p.studentId == s.id)
            return {...s, units}
        })
/*
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
        */
    } catch (e) {
        console.warn('Error in getStudentsResults: ', e.message)
        return []
    } 
    
    
}

export async function getStudentsInSubject (subjectId) {
    try {
        const res = await client.query(
            `SELECT
                s.id,
                s.name,
                s.bb_id
            FROM student AS s
            JOIN subject_student AS ss ON s.id = ss.student_id
            WHERE ss.subject_id = $1`,
            [ subjectId ]
        )
        const data = (res.rows || []).map(d => objectToCamelCase(d))
        return data
    } catch (e) {
        console.warn('Error in getStudentsInSubject: ', e.message)
        return []
    }
}


export async function getProgressByStudent (subjectId) {
    try {
        const res = await client.query(
            `SELECT
                p.student_id,
                c.unit_id,
                COUNT(p.*) as progress
            FROM (
                SELECT * FROM progress WHERE completed = TRUE
            ) AS p
            JOIN content AS c ON p.content_id = c.id
            JOIN unit AS u ON c.unit_id = u.id
            WHERE u.enabled = TRUE
                AND u.published = TRUE
                AND u.subject_id = $1
            GROUP BY p.student_id, c.unit_id
            ORDER BY p.student_id, c.unit_id`,
            [ subjectId ]
        )
        const data = (res.rows || []).map(d => objectToCamelCase(d))
        return data
    } catch (e) {
        console.warn('Error in getProgressByStudent: ', e.message)
        return []
    }
}