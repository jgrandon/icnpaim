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
    disableHigerLevels(unitId, data.length)
    const schemas = []
    for (let i = 0; i < data.length; i++) {
        const { level, minGrade, maxGrade } = data[i]
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
        schemas.push( res.rows[0] )
    }
    return schemas
}

export async function disableHigerLevels (unitId, maxLevel) {
    console.log('disableHigerLevels', unitId, maxLevel)
    const res = await client.query(
        `UPDATE learningrouteschema SET enabled = FALSE  
        WHERE unit_id = $1 AND level > $2 RETURNING *`,
        [ unitId, maxLevel ]
    )
    return res.rows
}

export async function getLearningRoutes(unitId) {
    const res = await client.query(
        `SELECT
            lrs.id, lrs.level, lrs.min_grade,
            lrs.max_grade, lrs.unit_id, lrd.position,
            lrd.content_id, c.title, c.type, c.url
        FROM LearningRouteSchema AS lrs
        FULL OUTER JOIN (
			SELECT * FROM LearningRouteData WHERE enabled = TRUE
		) AS lrd ON lrs.id = lrd.learning_route_id
        FULL OUTER JOIN Content as c ON lrd.content_id = c.id
        WHERE lrs.unit_id = $1
            AND lrs.enabled = TRUE
        ORDER BY lrs.level, lrd.position;`,
        [ unitId ]
    )
    const data = parseLearningRoutes(res.rows)
    return data
}

export async function getAllUnitsLearningRoutes(subjectId) {
    // TODO: add join unit
    // TODO: add restriction by unit.subject_id
    //console.log('getAllUnitsLearningRoutes => subjectId', subjectId)

    const res = await client.query(
        `SELECT
            lrs.id, lrs.level, lrs.min_grade,
            lrs.max_grade, lrs.unit_id, lrd.position,
            lrd.content_id, c.title, c.type, c.url
        FROM LearningRouteSchema AS lrs
        FULL OUTER JOIN (
            SELECT * FROM LearningRouteData WHERE enabled = TRUE
        ) AS lrd ON lrs.id = lrd.learning_route_id
        FULL OUTER JOIN Content as c ON lrd.content_id = c.id
        JOIN (
            SELECT * FROM Unit WHERE enabled = TRUE AND published = TRUE
        ) AS u ON lrs.unit_id = u.id
        WHERE lrs.enabled = TRUE
        AND u.subject_id = $1
        ORDER BY lrs.unit_id, lrs.level, lrd.position;`,
        [ subjectId ]
    )
    let unitsLR = {}
    //console.log('getAllUnitsLearningRoutes => rows', res.rows.length)
    res.rows.map (r => unitsLR[r.unit_id]
        ? unitsLR[r.unit_id].push( r )
        : unitsLR[r.unit_id] = [ r ]
    )
    //console.log('getAllUnitsLearningRoutes => rows', unitsLR)

    Object.keys(unitsLR).forEach(unitId => {
        const parsedData = parseLearningRoutes(unitsLR[unitId]).map(
            lr => ({ ...lr, cards: lr.contents })
        )
        unitsLR[unitId] = parsedData
    })
    return unitsLR
}

function parseLearningRoutes (data) {
    let learningRoutes = []
    data.map(currentLR => {
        const { id, level, min_grade,
            max_grade, unit_id,
            position, content_id,
            title, type, url
        } = currentLR
        const wasAdded = !!learningRoutes.find(lr => lr.id == currentLR.id)
        const content = currentLR.position == null
            ? null
            : { order: position,
                id: content_id,
                title, type, url }

        const lr = {
            id,
            level,
            minGrade: min_grade,
            maxGrade: max_grade,
            unitId: unit_id
        }
        if ( wasAdded ) {
            //console.log('wasAdded LR => ', lr, content)

            learningRoutes = learningRoutes.map(addedLR => {
                if (addedLR.id == lr.id) { //match duplicated lr
                    return {
                        ...addedLR,
                        contents: [ // update lr contents
                            ...addedLR.contents,
                            content
                        ]
                    }
                }
                else return addedLR //bypass lr
            })
        } else {
            //console.log('new LR => ', lr, content)
            learningRoutes.push({
                ...lr,
                contents: content==null ? [] : [ content ]
            })
        }
    })
    return learningRoutes
}

export async function updateLRContents(lrId, contents) {
    // disable prev contents
    await client.query(
        `UPDATE LearningRouteData
            SET enabled = FALSE
        WHERE learning_route_id = $1
        RETURNING *`,
        [ lrId ]
    )

    let updated = []
    for (let i = 0; i < contents.length; i++) {
        const { id, order } = contents[i]
        // create or update current contents
        const res = await client.query(
            `INSERT INTO LearningRouteData (position, learning_route_id, content_id, enabled) 
            VALUES ( $1, $2, $3, TRUE ) 
            ON CONFLICT (learning_route_id, content_id)
            DO UPDATE SET
                enabled = TRUE,
                position = $1
            RETURNING *`, [ order, lrId, id ])
        console.log('update response => ', res.rows[0])
        updated.push(res.rows[0])
    }
    return updated
}

export async function updateContentProgress ({
    studentId,
    contentId
}) {
    console.log('updateContentProgress DATA => ',{
        studentId,
        contentId
    })
    const res = await client.query(
        `INSERT INTO progress (content_id, student_id, completed) 
            VALUES ( $1, $2, TRUE ) 
            ON CONFLICT (content_id, student_id)
            DO UPDATE SET
                completed = TRUE
            RETURNING *`,
        [ contentId, studentId ]
    )
    console.log('upadteContentProgress response => rows', res.rows.length)
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