import WordPressApi from './wordpress'

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
	return retrievedUnit.courseId === courseId
		? retrievedUnit
		: null
}

/* Translates attributes from WordPress to ICNPAIM context */
function getUnitData (unit) {
		const { id, status, title } = unit
		const cards =
			unit.meta.unit_cards.length>0
			? JSON.parse(unit.meta.unit_cards)
			: {}

		return {
			id,
			status,
			title,
			content: unit.content.rendered,
			courseId: parseInt(unit.meta.course_id),
			cards
		}
}

export async function getUnitsByCourse (searchedCourse) {
	const units = await getUnits()
	return units.filter(u => u.courseId === searchedCourse )
}