import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import config from '../../config/config';

const db = new JsonDB(new Config(`${config.database_directory}/blackboard`, true, true, '/'));
const tokenDB = new JsonDB(new Config(`${config.database_directory}/blackboard_token`, true, false, '/'));


export async function getColumnId(contentId) {
    console.log('getColumnId')
    try {
        const contents = await db.getData('/content') ?? {}
        console.log('getColumnId => contents => ', contents)
        const searchedContent = contents[contentId]
        console.log('getColumnId => contents => ', contents)
        return searchedContent?.columnId
    } catch (error) {
        return null
    }
}

export async function insertNewContent(contentId, body) {
    await apps.push('/content', {
        [contentId] : body
    })
}

export async function getToken() {
    return await tokenDB.getData('/token')
}

export function saveToken (token) {
    return tokenDB.push('/token', token)
}