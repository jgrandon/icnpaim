import BlackBoardApiClient from '../clients/blackboard'
import { getColumnId, insertNewContent } from '../db/blackboard'

export async function getColumnByContent (courseId, contentId) {
    console.log('getColumnsByContent => start')
    const cachedColumnId = await getColumnId(contentId)
    console.log('getColumnsByContent => cachedColumnId' , cachedColumnId)

    if ( !!cachedColumnId ) return cachedColumnId
    console.log('getColumnsByContent => not cached')

    const apiClient = BlackBoardApiClient.getClient()
    console.log('getColumnsByContent => apiClient', apiClient)

    const request = await apiClient.get(
        `/v1/courses/${courseId}/contents/${contentId}`
    )
    console.log('getColumnsByContent => request', request.data)
    const column = request.data
    const { id: columnId } = column
    insertNewContent(contentId, { columnId})

    return column
}