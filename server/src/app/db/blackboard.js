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
        //console.log('getColumnId => cached columns => ', cachedColumns)
        const searchedColumn = columns.find(c => c.contentId === contentId)
        //console.log('getColumnId => columns => ', columns)
        return searchedColumn?.id
    } catch (error) {
        return null
    }
}

export async function getColumnByName(courseId, columnName) {
    console.log('getColumnId')
    try {
        const cachedColumns = await db.getData(`/course/${courseId}/columns`)
        const columns = cachedColumns ?? []
        const searchedColumn = columns.find( c => c.name.toLowerCase().includes(columnName.toLowerCase()) )
        console.log('bbCache => getColumnByName => searchedColumn => ', searchedColumn)
        return searchedColumn
    } catch (error) {
        return null
    }
}

export async function getContent(courseId, contentId) {
    console.log('getContents')
    try {
        const cachedContent = await db.getData(`/course/${courseId}/content/${contentId}`)
        return cachedContent
    } catch (error) {
        console.error('BLACKBOARD DB: getContent error: ', error)
        return null
    }
}

export function updateColumns(courseId, columns) {
    db.push(`/course/${courseId}/columns`, columns)
}

export function updateContent(courseId, content) {
    db.push(`/course/${courseId}/content/${content.id}`, content)
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

        console.warn('cache error getGrades =>',error.message)
        return []
    }
}

export async function getSubjectGrades(courseId) {
    try {
        const grades = await db.getData(`/grades/${courseId}`)
        return grades ?? []
    } catch (error) {
        console.warn(error)
        return []
    }
}

export function saveGrades(courseId, columnId, grades) {
    db.push(`/grades/${courseId}/${columnId}`, grades)
}

export async function getGroups(courseId) {
    try {
        const groups = await db.getData(`/courses/${courseId}/groups`)
        return groups
    } catch (error) {
        console.warn(error)
        return null
    }
}

export function saveGroups(courseId, groups) {
    db.push(`/courses/${courseId}/groups`, groups)
}
