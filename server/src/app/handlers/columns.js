import BlackBoardApiClient from '../clients/blackboard'

export async function getColumnByContent (contentId) {
    const apiClient = BlackBoardApiClient.getClient()
    const request = await apiClient.get(`/v1/courses/${courseId}/contents/${contentId}`)
    const column = request.data
    return column
}