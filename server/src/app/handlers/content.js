import { xor } from 'lodash'
import BlackBoardApiClient from '../clients/blackboard'
import * as cache from '../db/blackboard'

export async function getContentsByCourseId (courseId, ids) {
    console.log('getContentsById => start')
    let contents = []
    contents = await cache.getContents(courseId)
    const cachedIds = contents.map(c => c.id)
    const notCached = ids.filter(id => !cachedIds.includes(id))

    //console.log('getContentsById => cachedColumnId' , cachedColumnId)

    if ( notCached.length > 0 ) {
        // console.log('getContentsById => not cached')
    
        const apiClient = BlackBoardApiClient.getClient()
        //console.log('getColumnsByContent => apiClient', apiClient)
    
        const request = await apiClient.get(
            `/v1/courses/${courseId}/contents`
        )
        const newContents = request.data.results
        /*
        const column = request.data
        const { gradeColumnId: columnId } = column.contentHandler
        */
        cache.updateContents(courseId, newContents)
        contents = newContents
    }
    return contents.filter(c => ids.includes(c.id))
}