import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import config from '../../config/config';

const db = new JsonDB(new Config(`${config.database_directory}/blackboard`, true, true, '/'));
const tokenDB = new JsonDB(new Config(`${config.database_directory}/blackboard_token`, true, false, '/'));


export async function getColumnId(courseId, contentId) {
    console.log('getColumnId')
    try {
        const cachedColumns = await db.getData(`/course/${courseId}/columns`)
        const columns = cachedColumns ?? []
        console.log('getColumnId => cached columns => ', cachedColumns)
        const searchedColumn = columns.find(c => c.contentId === contentId)
        console.log('getColumnId => columns => ', columns)
        return searchedColumn?.id
    } catch (error) {
        return null
    }
}

export async function getContents(courseId) {
    console.log('getColumnId')
    try {
        const cachedContents = await db.getData(`/course/${courseId}/content`)
        const contents = cachedContents ?? []
        return contents
    } catch (error) {
        console.error('BLACKBOARD DB: getContents error: ', error)
        return []
    }
}

export function updateColumns(courseId, columns) {
    db.push(`/course/${courseId}/columns`, columns)
}

export function updateContents(contentId, body) {
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
        return []
    }
}

export function saveGrades(courseId, columnId, grades) {
    db.push(`/grades/${courseId}/${columnId}`, grades)
}