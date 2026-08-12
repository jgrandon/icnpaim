import BlackBoardApiClient from '../clients/blackboard'
import * as cache from '../db/blackboard'

export async function getGrade (
    courseId,
    columnId,
    studentId
) {
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
        const grades = request.data.results
        console.log('getGrade => grades', grades.length)

        cache.saveGrades(courseId, columnId, grades)
        console.log('studentId =>', studentId)
    console.log('grades =>', grades)

        searchedGrade = grades.find(g => g.userId == studentId)
    }
    console.log('searchedGrade =>', searchedGrade)
    return searchedGrade
}

export async function getSubjectGrades (
    bbCourseId,
    units
) {
    // im searching for units grades    
    const subjectGrades = {}
    for(let i=0; i < units.length; i++) {
        const current = units[i]
        const { evaluationId } = current.unit
        let grades = await cache.getGrades(bbCourseId)

        if (grades.length==0) {
            console.log('grade not cached => ', {bbCourseId, evaluationId})
            try {
                const apiClient = BlackBoardApiClient.getClient()
                const request = await apiClient.get(
                    `/v2/courses/${bbCourseId}/gradebook/columns/${evaluationId}/users`
                )
                const grades = request.data.results
                cache.saveGrades(bbCourseId, evaluationId, grades)
                //grades = grades.find(g => g.userId == studentId)
                subjectGrades[current.unit.id] = grades
            }
            catch (e) {
                console.log('error getting subject grades')
            } 
        } 
    }

    //console.log('getGrade => cachedGrades', cachedGrades.length)
    //searchedGrade = cachedGrades.find(cg => cg.userId == studentId)
    //console.log('getGrade => searchedGrade', searchedGrade)

    return subjectGrades
}