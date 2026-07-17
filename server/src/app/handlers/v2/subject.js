import client from '../../db/postgres'

export async function getSubjectByBBid(bbId) {
    const res = await client.query(
        `SELECT * FROM subject WHERE bb_id = $1`,
        [ bbId ]
    )
    const subject = res.rows[0]
    if (!subject) return null
    return { ...subject, bbId }
}

export async function getOrCreate (data) {
    let subject = await getSubjectByBBid(data.bbId)
    if (!subject) {
        subject = await createSubject(data)
    }
    return subject
}

export async function createSubject ({
    name,
    bbId
}) {
    const res = await client.query(
        `INSERT INTO subject (name, bb_id) 
        VALUES ($1, $2)
        RETURNING *`,
        [ name, bbId ]
    )
    const subject = res.rows[0]
    return { ...subject, bbId }
}
