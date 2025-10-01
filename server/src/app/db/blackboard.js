import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import config from '../../config/config';

const db = new JsonDB(new Config(`${config.database_directory}/blackboard`, true, true, '/'));
const tokenDB = new JsonDB(new Config(`${config.database_directory}/blackboard_token`, true, false, '/'));


export async function getColumnId(contentId) {
    console.log('getColumnId')
    try {
        const cachedContents = await db.getData('/content')
        const contents = cachedContents ?? {}
        console.log('getColumnId => contents => ', contents)
        const searchedContent = contents[contentId]
        console.log('getColumnId => contents => ', contents)
        return searchedContent?.columnId
    } catch (error) {
        return null
    }
}

export function insertNewContent(contentId, body) {
    db.push('/content', {
        [contentId] : body
    })
}

export async function getToken() {
    try {
        return await tokenDB.getData('/token')
    } catch (error) {
        return null
    }
}

export function saveToken (token) {
    tokenDB.push('/token', token, true)
}

export async function getStudentId(externalStudentId,) {
    console.log('cache => getStudentId', externalStudentId)
    try {
        const cachedStudents = await db.getData('/student')
        const students = cachedStudents ?? {}
        const searchedStudent = students[externalStudentId]
        return searchedStudent.id
    } catch (error) {
        return null
    }
}

export function updateStudentId(externalStudentId, studentId) {
    console.log('cache => updateStudentId => externalStudentId', externalStudentId)
    console.log('cache => updateStudentId => studentId', studentId)

    db.push('/student', {
        [externalStudentId] : {studentId}
    })
}

export async function getGrades(courseId, columnId) {
    try {
        const grades = await db.getData(`/grades/${courseId}/${columnId}`)
        return grades ?? []
    } catch (error) {
        return null
    }
}

export function saveGrades(courseId, columnId, grades) {
    db.push(`/grades/${courseId}/${columnId}`, grades)
}