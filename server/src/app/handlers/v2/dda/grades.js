import client from '../../../db/dda'
import { objectToCamelCase } from '../../../lib/objectToCamelCase'

export async function getStudentGrades(studentId, courseId) {
    const res = await client.query(
        `select 
          gbm.pk1 AS gradebook_id,
          gbm.title AS content_title,
          gbm.crsmain_pk1 AS course_id,
          gbm.course_contents_pk1 AS content_id,
          gbg.average_score,
          a.score,
          cu.users_pk1 as user_id
          FROM gradebook_main AS gbm
          JOIN gradebook_grade AS gbg ON gbm.pk1 = gbg.gradebook_main_pk1
          JOIN attempt AS a ON gbg.highest_attempt_pk1 = a.pk1
          JOIN course_users AS cu ON gbg.course_users_pk1 = cu.pk1
          WHERE cu.users_pk1 = $1 AND gbm.crsmain_pk1 = $2`,
        [ studentId, courseId ]
    )
    const grades = res.rows.map(r => objectToCamelCase(r))
    return grades
}