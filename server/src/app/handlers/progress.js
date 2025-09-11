import WordPressApi from './wordpress'
import safeJsonParse from './../lib/safeJsonParse'

export async function getProgressByUnits ( studentId, courseId ) {
    const response = await WordPressApi.client.get(
        `/progress?search=progress-${studentId}-${courseId}`
    )
    let progressByUnits = []
    let iUnits = Object.keys(response.data).length
    for (let i = 0; i < iUnits; i++) {
        const rawProgress = response.data[i].meta
        const unitId = rawProgress[i].meta.unit_id
        const completedCards = safeJsonParse(rawProgress[i].meta.completed_card_ids)
        progressByUnits[unitId] = completedCards
    }
    return progressByUnits
}