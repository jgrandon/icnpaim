import { LibraryMusic } from '@material-ui/icons'
import BlackBoardApiClient from '../clients/blackboard'
import * as cache from '../db/blackboard'
import { escape, last } from 'lodash'

export async function getColumnIdByContent (courseId, contentId) {
    console.log('getColumnsByContent => start => courseId', courseId)
    console.log('getColumnsByContent => start => contentId', contentId)
    const cachedColumnId = await cache.getColumnId(courseId, contentId)
    console.log('getColumnsByContent => cachedColumnId' , cachedColumnId)

    if ( !!cachedColumnId ) return cachedColumnId
    console.log('getColumnsByContent => not cached')

    const apiClient = BlackBoardApiClient.getClient()
    //console.log('getColumnsByContent => apiClient', apiClient)

    const request = await apiClient.get(
        `/v2/courses/${courseId}/gradebook/columns`
    )
    const allColumns = request.data.results
    console.log('getColumnsByContent => columns length', allColumns.length)

    const column = allColumns.find(c => c.contentId == contentId)
    //if (!column) console.log('column not found: allColumns => ', allColumns)
    cache.updateColumns(courseId, allColumns)

    return column?.id
}