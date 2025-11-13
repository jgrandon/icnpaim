import { xor } from 'lodash'
import BlackBoardApiClient from '../clients/blackboard'
import * as cache from '../db/blackboard'

export async function getContentsByIds (courseId, ids) {
    let contents = []
    const apiClient = BlackBoardApiClient.getClient()

    for (let i = 0; i < ids.length; i++) {
        const contentId = ids[i]
        const cachedContent = await cache.getContent(courseId, contentId)
        if (!!cachedContent) contents.push(cachedContent)

        //get from blackboard
        const request = await apiClient.get(
            `/v1/courses/${courseId}/contents/${contentId}`
        )
        const content = request.data
        cache.updateContent(courseId, content)
        contents.push(content)
    }

    return contents
}