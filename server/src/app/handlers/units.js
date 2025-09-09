import WordPressApi from './wordpress'

export async function getUnits() {
	const response = await WordPressApi.client.get(
		//`/unit/?search=${courseId}`
		`/unit`
	)

	return response.data.map( u => ({
		id: u.id,
		//courseCode: getCourseCode(u.title),
		status: u.status,
		title: getTitle(u.title),
		content: u.content.rendered,
		courseId: meta.course_id
		//unitCode: getUnitCode(u.title)
	}))
}

function getTitle ( title) {
	const maskedTitle =
		title.rendered
			.replaceAll('| ', '')
			.split(' ')
			.splice(3)
			.join(' ')
	return maskedTitle
}

function getCourseCode ( title ) {
	return title.rendered.split(' ').splice(0,2).join(' ')
}

function getUnitCode ( title ) {
	const code =
		title.rendered
			.replaceAll('| ', '')
			.split(' ')
			.splice(0,3)
			.join(' ')
	return code
}

export async function getUnitsByCourse (searchedCourse) {
	const units = getUnits()
	return units.filter(u => u.courseId === searchedCourse )
}