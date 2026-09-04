import client from '../../db/postgres'
import BlackBoardApiClient from '../../clients/blackboard'
import * as cache from '../../db/blackboard'

export async function getAllContents(unitId) {
    const res = await client.query('SELECT * FROM content WHERE unit_id=$1', [ unitId ])
    return res.rows
}

export async function createContent(data) {
    const { title, type, unitId } = data
    const { url, bbContentId } = processUrl(data)
    const res = await client.query(
        'INSERT INTO content (title, type, url, unit_id, bb_content_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [ title, type || 'Contenido', url, unitId, bbContentId ]
    )
    return res.rows[0]
}

export async function updateContent(data) {
    const { id, title, type, unitId } = data
    const { url, bbContentId } = processUrl(data)
    const res = await client.query(
        `UPDATE content SET 
        title = $1,
        type = $2,
        url = $3,
        unit_id = $4,
        bb_content_id = $5
        WHERE id = $6 RETURNING *`,
        [ title, type || 'Contenido', url, unitId, bbContentId, id ]
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

function processUrl ({
    type,
    url: originalUrl
}) {
    let url = originalUrl
    let bbContentId = null
    try {
        const courseId = getCourseIdFromURL(originalUrl)
        if (type == 'control') {
            const isAdminUrl = originalUrl.indexOf('assessment/test') != -1
            const match = isAdminUrl
                ? originalUrl.match(/assessment\/test\/(.*?)(?=\?gradeitemView)/)
                : originalUrl.match(/assessment\/(.*?)(?=\/overview)/)
            if (match) {
                bbContentId = match[1]
                url = originalUrl.slice( 0, originalUrl.indexOf(match[0]))
                    + `assessment/${bbContentId}/overview?courseId=${courseId}`
            }
            // https://udla-staging.blackboard.com/ultra/courses/_89726_1/assessment/_4639208_1/overview?courseId=_89726_1
            // https://udla-staging.blackboard.com/ultra/courses/_89726_1/assessment/test/_4639208_1?gradeitemView=details
        } else if (type == 'scorm') {
            const isAdminUrl = originalUrl.indexOf('scorm/overview') == -1
            const match = isAdminUrl
                ? originalUrl.match(/scorm\/(.*?)(?=\/columns)/)
                : originalUrl.match(/scorm\/overview\/(.*)/)
            if (match) {
                bbContentId = match[1]
                url = originalUrl.slice( 0, originalUrl.indexOf('scorm'))
                    + `scorm/overview/${bbContentId}`
            }
            //https://udla-staging.blackboard.com/ultra/courses/_89726_1/scorm/overview/_4639218_1
            //https://udla-staging.blackboard.com/ultra/courses/_89726_1/scorm/_4639218_1/columns/_1077428_1/submissions?courseId=_89726_1&gradeitemView=students
        } else if (type == 'labster') {
            //const isAdminUrl = originalUrl.indexOf('/lti/launch?') == -1
            const match = originalUrl.match(/contentId\=(.*)/)
            if (match) bbContentId = match[1]
        } 
    
        console.log('processUrl originalUrl => ',originalUrl)
        console.log('processUrl finalUrl => ',url)
        console.log('processUrl bbContentId => ',bbContentId)
        
        const cleanContentId = cleanBBId(bbContentId)
        console.log('processUrl cleanContentId => ',cleanContentId)

        return { url, bbContentId: cleanContentId }
    } catch (e) {
        console.error('ERROR: processUrl() => ', e)
        return { url, bbContentId }
    }
}

function cleanBBId(identifier) {
    if (identifier.startsWith('_')) {
        identifier = identifier.slice(1);
    }
    if (identifier.endsWith('_1')) {
        identifier = identifier.slice(0, -2);
    }
    return identifier;
}

function getCourseIdFromURL (url) {
    const match = url.match(/courses\/(.*?)(?=\/)/)
    return match ? match[1] : null
}

export async function getBBGroups (
    bbCourseId
) {
    const cachedGroups = await cache.getGroups(bbCourseId)
    if (!!cachedGroups) return cachedGroups

    const apiClient = BlackBoardApiClient.getClient()
    const request = await apiClient.get(
        `/v2/courses/${bbCourseId}/groups`
    )
    const { results } = request.data
    const groups = []
    for(let i=0; i < results.length; i++) {

        const { id, name } = results[i]
        console.log(`getBBGroups =>  group ${id}`, group)
        const studentsRequest = await apiClient.get(
            `/v2/courses/${bbCourseId}/groups/${id}/users`
        )
        const students = studentsRequest.data.results
        console.log(`getBBGgroups => group ${id} => students`, students)
        groups.push({ id, name, students })
    }

    cache.saveGroups(bbCourseId, groups)
    return groups

    //{{BLACKBOARD_API_URL}}/v2/courses/{{BLACKBOARD_COURSE_ID}}/groups/_622428_1/users
}

