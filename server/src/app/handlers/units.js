import WordPressApi from './wordpress'

export async function getUnits( courseId ) {
	const response = await WordPressApi.client.get(
		`/unit/?search=${courseId}`
	)

	return response.data.map( u => ({
		id: u.id,
		courseCode: getCourseCode(u.title),
		status: u.status,
		title: getTitle(u.title),
		content: u.content.rendered,
		unitCode: getUnitCode(u.title)
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