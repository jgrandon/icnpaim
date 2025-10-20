import { LibraryMusic } from '@material-ui/icons'
import BlackBoardApiClient from '../clients/blackboard'
import * as cache from '../db/blackboard'
import { escape, last } from 'lodash'

export async function getColumnIdByContent (courseId, contentId) {
    //console.log('getColumnsByContent => start')
    const cachedColumnId = await cache.getColumnId(contentId)
    //console.log('getColumnsByContent => cachedColumnId' , cachedColumnId)

    if ( !!cachedColumnId ) return cachedColumnId
    //console.log('getColumnsByContent => not cached')

    const apiClient = BlackBoardApiClient.getClient()
    //console.log('getColumnsByContent => apiClient', apiClient)

    const request = await apiClient.get(
        `/v1/courses/${courseId}/contents/${contentId}`
    )
    //console.log('getColumnsByContent => request', request.data)
    const content = request.data
    const { gradeColumnId: columnId } = content.contentHandler
    cache.insertNewContent(contentId, { columnId })

    return columnId
}