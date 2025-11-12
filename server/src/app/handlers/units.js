import WordPressApi from '../clients/wordpress'
import safeJsonParse from './../lib/safeJsonParse'

async function getUnits(studentId) {
	const response = await WordPressApi.client.get(
		`/unit?orderby=id&order=asc`
	)
	console.log('response.data => ',typeof response.data)

	return response.data.map( u => getUnitData(u, studentId))
}

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
}

/* Translates attributes from WordPress to ICNPAIM context */
function getUnitData (unit, studentId) {
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