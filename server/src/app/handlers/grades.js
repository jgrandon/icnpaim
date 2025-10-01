import BlackBoardApiClient from '../clients/blackboard'
import * as cache from '../db/blackboard'

export async function getGrade (
    courseId,
    columnId,
    studentId
) {
    let grades = []
    const cachedGrades = cache.getGrades(courseId, columnId)
    if (cachedGrades.length>0) {
        grades = cachedGrades
    } else {
        const apiClient = BlackBoardApiClient.getClient()
        const request = await apiClient.get(
            `/v2/courses/${courseId}/gradebook/columns/${columnId}/users/${studentId}`
        )
        grades = request.data.results
        cache.saveGrades(courseId, columnId, grades)
    }
    const grade = grades.find(g => g.userId == studentId)
    return grade
}
