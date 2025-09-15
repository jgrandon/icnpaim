import BlackBoardApiClient from '../clients/blackboard'

export default async function getUserEvaluationGrade (courseId, columnId, studentId) {
    const apiClient = BlackBoardApiClient.getClient()
    const request = await apiClient.get(`/v1/courses/${courseId}/gradebook/columns/${columnId}/users/${studentId}`)
    const grade = request.data.score
    return grade
}