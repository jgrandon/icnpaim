import { xor } from 'lodash'
import BlackBoardApiClient from '../clients/blackboard'
import * as cache from '../db/blackboard'

export async function getContentsByIds (courseId, ids) {
    console.log('getContentsById => start')
    let contents = []
    contents = await cache.getContents(courseId)
    const cachedIds = contents.map(c => c.id)
    const notCached = ids.filter(id => !cachedIds.includes(id))

    console.log('getContentsById => notCached' , notCached)

    if ( notCached.length > 0 ) {
        contents = await getContents(courseId)
        console.log('getContentsById => contents' , contents)
    }
    return contents.filter(c => ids.includes(c.id))
}
/*
export async function getAllContents (courseId) {
    let contents = await cache.getContents(courseId)
    if (contents.length > 0) return contents 
    else return await getContents(courseId)
}
*/
export async function getContents(courseId) {
    console.log('getContents => not cached')

    const apiClient = BlackBoardApiClient.getClient()
    //console.log('getColumnsByContent => apiClient', apiClient)

    const request = await apiClient.get(
        `/v1/courses/${courseId}/contents`
    )
    const contents = request.data.results
    
    console.log('newContents length => ', contents.length)
    console.log('newContents => ', contents.map(c => c.id))

    /*
    const column = request.data
    const { gradeColumnId: columnId } = column.contentHandler
    */
    cache.updateContents(courseId, contents)
    return contents
}