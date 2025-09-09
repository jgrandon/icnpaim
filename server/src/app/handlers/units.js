import WordPressApi from './wordpress'

async function getUnits() {
	const response = await WordPressApi.client.get(
		`/unit?orderby=id&order=asc`
	)

	return response.data.map( u => getUnitData(u))
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
			courseId: unit.meta.course_id,
			cards
		}
}

export async function getUnitsByCourse (searchedCourse) {
	const units = await getUnits()
	return units.filter(u => u.courseId === searchedCourse )
}