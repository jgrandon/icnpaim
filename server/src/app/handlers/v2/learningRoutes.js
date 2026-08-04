import { toLower } from 'lodash'
import client from '../../db/postgres'
import { objectToCamelCase } from '../../lib/objectToCamelCase'

const __DEFAULT_MIN_GRADE = 1
const __DEFAULT_MAX_GRADE = 7

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

export async function getContentsByLevel(subjectId) {
    const res = await client.query(
        `SELECT
            u.name,
            u.evaluation_id,
            rslt.*
        FROM unit AS U
        JOIN (
            SELECT
                lrs.unit_id as id,
                lrs.level,
                lrs.min_grade,
                lrs.max_grade,
                COUNT(*) FILTER (WHERE lrd.enabled = TRUE) AS total
            FROM learningrouteschema AS lrs
            LEFT JOIN learningroutedata AS lrd ON lrs.id = lrd.learning_route_id
            WHERE lrs.enabled = TRUE
            GROUP BY  lrs.level, lrs.unit_id, lrs.min_grade, lrs.max_grade
            ) AS rslt ON rslt.id = u.id
            WHERE u.enabled = TRUE
            AND u.published = TRUE
            AND u.subject_id = $1
        ORDER BY u.id, rslt.level`,
        [subjectId]
    )
    const data = res.rows || []
    let contents = []
    //data.forEach((d) => {
    for(let i=0; i < data.length; i++) {
        const row = objectToCamelCase(data[i])
        const {id, name, evaluationId, level, total, maxGrade, minGrade} = row
        const currentLevel = { level, total, maxGrade, minGrade }
        const existing = contents.find(c => c.unit.id == id)
        if (!existing){
            contents.push({
                unit: {
                    id, name, evaluationId
                },
                levels: [currentLevel]
            })
        } else {
            console.log('pushing new level => existing', existing)
            console.log('pushing new level => currentLevel', currentLevel)
            existing.levels.push(currentLevel)
        }
    }
    return contents
}