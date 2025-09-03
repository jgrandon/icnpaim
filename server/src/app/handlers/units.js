import WordPressApi from './wordpress'

export async function getUnits( courseId ) {
	const response = await WordPressApi.client.get(
		`/unit/?search=${courseId}`
	)

	return response.data.map( u => ({
		id: u.id,
		status: u.status,
		title: u.title.rendered,
		content: u.content.rendered
	}))
}
