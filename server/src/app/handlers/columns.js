import BlackBoardApiClient from '../clients/blackboard'
import { getColumnId, insertNewContent } from '../db/blackboard'

export async function getColumnByContent (courseId, contentId) {
    const cachedColumnId = getColumnId(contentId)
    if ( !!cachedColumnId ) return cachedColumnId

    const apiClient = BlackBoardApiClient.getClient()
    const request = await apiClient.get(
        `/v1/courses/${courseId}/contents/${contentId}`
    )
    const column = request.data
    const { id: columnId } = column
    insertNewContent(contentId, { columnId})

    return column
}