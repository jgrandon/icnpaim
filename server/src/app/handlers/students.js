getStudentId

import BlackBoardApiClient from '../clients/blackboard'
import * as cache from '../db/blackboard'

export async function getStudentId (
    studentExternalId
) {
    const cachedStudentId = await cache.getStudentId(studentExternalId)
    if (!!cachedStudentId) return cachedStudentId

    const apiClient = BlackBoardApiClient.getClient()
    const request = await apiClient.get(
        `/v1/users?externalId=${studentExternalId}`
    )
    const studentId = request.data.results[0]?.id
    await cache.updateStudentId(studentExternalId, studentId)
    return studentId
}