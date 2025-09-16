import WordPressApi from '../clients/wordpress'
import safeJsonParse from './../lib/safeJsonParse'

async function getUnits() {
	const response = await WordPressApi.client.get(
		`/unit?orderby=id&order=asc`
	)

	return response.data.map( u => getUnitData(u))
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
function getUnitData (unit) {
		const { id, status, title } = unit
		const allCards = safeJsonParse(unit.meta.unit_cards) ?? []
		console.log('getUnitData => cars number =>', allCards.length)
		return {
			id,
			status,
			title,
			content: unit.content.rendered,
			courseId: unit.meta.course_id,
			cards: allCards,
			learningRoutes: getLearningRoutes(allCards),
			contentId: unit.meta?.content_id ?? 0,
		}
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
	return cards.sort((a,b) => a.peso - b.peso)
}

export async function getCourseUnits (searchedCourse) {
	const units = await getUnits()
	return units.filter(
		u => u.courseId == searchedCourse
	)
}