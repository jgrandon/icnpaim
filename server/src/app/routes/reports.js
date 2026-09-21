import express from 'express';

const router = express.Router();

router.get('/v2/report' , requireLTISession, async (req, res) => {
    try {
        const { bbCourseId, subject } = req.ltiSession
        const students = await studentHandler.getStudentsResults(subject)
        const units = await LRHandler.getContentsByLevel(subject.id)
        const subjectGrades = await ddaGradesHandler.getCourseGrades(bbCourseId)
        const groups = await ddaCourseHandler.getGroups(bbCourseId) //get students by group
        
        
        const report = students.map(student => {
            const progress = units.map(u => {
                const noProgress = { unitId: u.id, value: 0, total: 0, percentage: 0 }
                // find unit grade:
                // compare name instead of id so i match the row
                // that has grades instead of the first matching row
                const evaluationTitle = u.position < 2
                    ? 'prueba de conocimientos iniciales'
                    : `${calculatedGradeKeyword} ${(u.position - 1)}`.toLowerCase()

                const grade = subjectGrades.find( g => 
                    g.userId == student.bbId
                    && g.title.toLowerCase().includes(evaluationTitle)
                )
                if (!grade) {
                    return noProgress
                }
                
                // get displayable score
                let studentGrade = NaN
                try { studentGrade = (grade.score * 6 / grade.possible) + 1 }
                catch (e) { console.warn('/v2/report => ERROR while trying to parse student grade', e.message) } 
                if (studentGrade==NaN) {
                    return noProgress
                }
                console.log('unit with grade => ', u)
                console.log('studentGrade', studentGrade)
                console.log('u.levels', u.levels)
                // select LR route
                const studentLevel = u.levels.find(level => (level.minGrade <= studentGrade && level.maxGrade >= studentGrade))
                // iterate lr contents
                const contentProgressDetail = studentLevel.contents?.map(c => {
                    // for each find local content or bb content
                    const localContentProgress = student.progress.find(localContent => localContent.contentId == c.contentId)
                    let completed = !!localContentProgress
                    let bbContentGrade = null
                    if (c.bbId) { // is a gradable content
                        bbContentGrade = c.bbId && subjectGrades.find(g => 
                            g.userId == student.bbId
                            && g.contentId == c.bbId)
                        completed = !!bbContentGrade
                    }
                    return {
                        ...c,
                        grade: bbContentGrade,
                        completed: !!completed
                    }
                })

                const completedContents = contentProgressDetail.filter(c => c.completed)
                const value = completedContents.length
                const total = contentProgressDetail.length

                return {
                    unitId: u.id,
                    value,
                    total,
                    level: studentLevel.level,
                    contents: contentProgressDetail,
                    percentage: +(value * 100 / total).toFixed(1)
                }
            })
            
            return {
                student,
                progress,
                //group
            }
        })
        

        return res.status(200).json({
            ok: true,
            students: report,
            units,
            subjectGrades,
            groups,
            report /* for debuggin only */
        })
    } catch (error) {
        console.error('Error in Results Report API => ', error)
        return res.status(200).json({
            success: false,
            error: error.message ?? 'unknown error'
        })
    }
})

export default router