export default function safeJsonParse(json) {
	try {
		return JSON.parse(json)
	} catch (e) {
		console.warn('ERROR: error parsing JSON => json', json)
		console.warn('ERROR: error parsing JSON => error', e)
		return null
	} 
}