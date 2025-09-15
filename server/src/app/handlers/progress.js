import WordPressApi from '../clients/wordpress'
import safeJsonParse from './../lib/safeJsonParse'

export async function getProgressByUnits ( studentId, courseId ) {
    const response = await WordPressApi.client.get(
        `/progress?search=progress-${studentId}-${courseId}`
    )
    let progressByUnits = []
    let iUnits = Object.keys(response.data).length
    for (let i = 0; i < iUnits; i++) {
        const { unit_id: unitId } = response.data[i].meta
        const rawProgress = response.data[i].meta.completed_card_ids
        progressByUnits[unitId] = safeJsonParse(rawProgress)
    }
    return progressByUnits
}