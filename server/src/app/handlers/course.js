import WordPressApi from './wordpress'

export async function getCourse( courseName ) {
    const response = await WordPressApi.client.get(
        `/course/?search=${courseName}`
    )

    return response.data.map( u => ({
        id: u.id,
        status: u.status,
        title: u.title.rendered,
        content: u.content.rendered
    }))
}
