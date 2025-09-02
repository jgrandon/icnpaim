import WordPressApi from './wordpress'

export async function getUnits( courseId ) {
const response = await WordPressApi.client.get(
	`/unit/?post=${courseId}`
);
	const { data : units } = response
	return units
}
