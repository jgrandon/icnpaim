import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import config from '../../config/config';

const db = new JsonDB(new Config(`${config.database_directory}/blackboard`, true, true, '/'));


export function getColumnId(contentId) {
    const contents = db.getData('content') ?? {}
    const searchedContent = contents[contentId]
    return searchedContent?.columnId
}

export async function insertNewContent(contentId, body) {
    apps.push('content', {
        [contentId] : body
    })
}