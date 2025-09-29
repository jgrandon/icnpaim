import BlackBoardApiClient from '../clients/blackboard'
import * as cache from '../db/blackboard'

export async function getGrade (
    courseId,
    columnId,
    studentId
) {
    const apiClient = BlackBoardApiClient.getClient()
    const request = await apiClient.get(
        `/v1/courses/${courseId}/gradebook/columns/${columnId}/users/${studentId}`
    )
    const grade = request.data.score
    return grade
}

export async function getMaxScore (
    courseId,
    columnId
) {
    const cachedMaxScore = await cache.getColumnMaxScore(columnId)
    if (!!cachedMaxScore) return cachedMaxScore
    
    const apiClient = BlackBoardApiClient.getClient()
    const request = await apiClient.get(
        `/v1/courses/${courseId}/gradebook/columns/${columnId}`
    )
    const {possible: maxScore} = request.data.score
    await cache.updateColumnMaxScore(maxScore)
    return maxScore
}
