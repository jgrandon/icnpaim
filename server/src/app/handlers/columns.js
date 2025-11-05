import { LibraryMusic } from '@material-ui/icons'
import BlackBoardApiClient from '../clients/blackboard'
import * as cache from '../db/blackboard'
import { escape, last } from 'lodash'

export async function getColumnIdByContent (courseId, contentId) {
    console.log('getColumnsByContent => start')
    const cachedColumnId = await cache.getColumnId(courseId, contentId)
    console.log('getColumnsByContent => cachedColumnId' , cachedColumnId)

    if ( !!cachedColumnId ) return cachedColumnId
    console.log('getColumnsByContent => not cached')

    const apiClient = BlackBoardApiClient.getClient()
    //console.log('getColumnsByContent => apiClient', apiClient)

    const request = await apiClient.get(
        `/v1/courses/${courseId}/gradebook/columns`
    )
    console.log('getColumnsByContent => columns length', request.data.length)

    const column = request.data.find(c => c.contentId == contentId)
    cache.updateColumns(courseId, request.data)

    return column?.id
}