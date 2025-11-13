import BlackBoardApiClient from '../clients/blackboard'
import * as cache from '../db/blackboard'

export async function getGrade (
    courseId,
    columnId,
    studentId
) {
    let grades = []
    let searchedGrade = null

    const cachedGrades = await cache.getGrades(courseId, columnId)
    console.log('getGrade => cachedGrades', cachedGrades.length)
    searchedGrade = cachedGrades.find(cg => cg.userId == studentId)
    console.log('getGrade => searchedGrade', searchedGrade)

    if (!searchedGrade) {

        const apiClient = BlackBoardApiClient.getClient()
        const request = await apiClient.get(
            `/v2/courses/${courseId}/gradebook/columns/${columnId}/users`
        )
        grades = request.data.results
        console.log('getGrade => grades', grades.length)

        cache.saveGrades(courseId, columnId, grades)
        searchedGrade = grades.find(g => g.userId == studentId)
    }
    return searchedGrade
}
