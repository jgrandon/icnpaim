import * as UnitsHandler from './units'
import client from '../../db/postgres'

export async function getUnitsWithCards(courseId = '1', studentId) {
    // const response = await UnitsHandler.getAllUnits()
    // console.log('response.data => ',typeof response.data)
    const res = await client.query(
        `SELECT
            u.*,
            u.bb_id as bbId,
            c.id as contentId,
            c.title,
            c.type,
            c.url,
            p.completed
        FROM unit AS u
        FULL OUTER JOIN content AS c
            ON c.unit_id = u.id
        LEFT JOIN (
            SELECT * FROM progress WHERE student_id = $1
        ) AS p
            ON p.content_id = c.id
        WHERE u.subject_id = $2
            AND u.enabled = TRUE
        ORDER BY u.position, c.id; `,
        [ studentId, courseId ]
    )
    
    console.log('getUnitsWithCards => rows', res.rows.length)

    let units = []

    for (let i=0; i < res.rows.length; i++) {
        
        const row = res.rows[i]
        console.log('getUnitsWithCards => for ', {i, row})
        const { id, name, color, position, bbId,
            contentid, title, type, url, completed } = row

        const content = { id: contentid,
            title, type, url, completed }
        const unit = { id, name, color, position, bbId }

        const inArray = units.find(u => row.id==u.id )
        if (!inArray) {
            console.log('getUnitsWithCards => new ')

            units.push({ ...unit,
                cards: content.id ? [ content ] : [] })
            continue
        }
        console.log('getUnitsWithCards => inArray ')

        units = units.map(u => unit.id==u.id
            ? { ...u, cards: [ ...u.cards, content ]} // add content
            : u ) // bypass
    }
    return units
}



/* Translates attributes from WordPress to ICNPAIM context */
function getUnitData (unit) {
    const { id, status, title } = unit
    const cards = safeJsonParse(unit.meta.unit_cards) ?? []
    return {
        id,
        status,
        title,
        content: clearContent(unit.content.rendered),
        color: unit.meta.color,
        freeProgress: unit.meta.free_progress,
        courseId: unit.meta.course_id,
        cards,
        //learningRoutes: getLearningRoutes(allCards),
        contentId: unit.meta?.content_id ?? 0,
    }
}

/*
export async function getUnit (unitId, courseId) {
    console.log('getUnit => unitId', unitId)
    console.log('getUnit => courseId', courseId)

    const response = await WordPressApi.client.get(
        `/unit/${unitId}`
    )
    console.log('getUnit => response.data', response.data)
    const retrievedUnit = getUnitData(response.data)
    console.log('getUnit => retrievedUnit', retrievedUnit)
    return retrievedUnit.courseId == courseId
        ? retrievedUnit
        : null
}*/

function clearContent(content) {
    return content
        .replaceAll('<p>','')
        .replaceAll('</p>', '')
}

function fixScormUrl(cards, studentId) {
    const userKey = 'UserId%7C'
    return cards.map(c => {
        const cardOldUserId = c.url.split(userKey)[1]?.split('&')[0]
        if (!cardOldUserId) return c
        const newUrl = c.url.replace(cardOldUserId, studentId )
        return {
            ...c,
            url: newUrl
        }
    })
}

export function getLearningRoutes(cards) {
    let routes = []
    const iCards = cards.length
    for (let i = 0; i < iCards; i++) {
        console.log('getLearningRoutes => inside for', i)
        const currentCard = cards[i] 
        const routeId = getRouteId(currentCard)
        const oldRoutes = routes[routeId] ?? []
        const newRoutes = [...oldRoutes, currentCard]
        routes[routeId] = sortCardsByWeight(newRoutes)
    }
    return routes
}

function getRouteId (card) {
    try {
        const id = parseInt(card.learningRoute) - 1
        return id > 0 ? id : 0
    } catch (e) {
        console.warn('Error parsing learningRoute', card, error)
        return 0
    } 
}

function sortCardsByWeight (cards) {
    const sortedCards = cards.sort((a,b) => a.peso - b.peso)
    return sortedCards.map((c, index) => ({...c, index}))
}

export async function getCourseUnits (searchedCourse, studentId) {
    const units = await getUnits(studentId)
    return units.filter(
        u => u.courseId == searchedCourse
    )
}