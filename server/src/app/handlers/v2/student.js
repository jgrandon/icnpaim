import client from '../../db/postgres'

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
