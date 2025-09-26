import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import config from '../../config/config';

const db = new JsonDB(new Config(`${config.database_directory}/blackboard`, true, true, '/'));


export function getColumnId(contentId) {
    const contents = db.getData('content') ?? []
    const searchedContent = contents.map((c, cId) => cId == contentId)[0]
    return searchedContent?.columnId
}

export async function insertNewContent(contentId, body) {
    apps.push('columns', {
        [contentId] : body
    })
}