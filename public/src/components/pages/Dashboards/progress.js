import React from 'react'
import { v4 as uuidv4 } from 'uuid';
import {
    PanoramaFishEye as AllTasksIcon,
    CheckCircleOutline as CompletedTasksIcon,
    TrackChanges as PendingTasksIcon
 } from '@material-ui/icons';
import { LinearProgress } from '@material-ui/core';

const styles = {
    progressDashboard : {
        display: 'grid',
        maxWidth: 850,
        boxShadow: 'rgba(0, 0, 0, 0.15) 1px 2px 6px 3px',
        borderRadius: '1rem',
        padding: 32,
        margin: 'auto'
    },
    titleContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontWeight: '700',
        fontSize: '1.875rem',
        lineHeight: '2.25rem',
    },
    detail: {
        fontSize: '1.125rem',
        lineHeight: '1.75rem'
    },
    tasksProgress: {
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: 32
    },
    tasksProgressDetail: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'space-arround',
        padding: '30px',
        alignItems: 'center',
        fontWeight: 500,
    },
    detailNumber: {
        fontWeight: 700,
        fontSize: '1.875rem',
        lineHeight: '2.25rem'
    },
    generalProgress: {
        display: 'grid',
        gridTemplateColumns: '10fr 1fr',
    },
    generalProgressBar: {
        margin: '10px 0px',
        gridArea: '2 / 1 / 2 / 11',
    },
    nextTask: {
        display: 'flex',
        justifyContent: 'space-between',
        color: 'rgb(36, 97, 233)',
        border: '1px solid rgb(191 219 254)'
    },
    button: {
        width: 145,
        padding: '0.75rem 1.5rem',
    },
    bold: {
        fontWeight: 700,
        fontSize: '1.125rem',
        lineHeight: '1.75rem'
    },
    icon: {
        widht: 80,
        height: 80,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    }
}

export default function ProgressDashboard(props) {
    const { 
        units,
        onNextTask = (task) => {}
     } = props
    const isLoading = units.length==0
    const allTasks = isLoading ? [] : units.map(u => u.studentLearningRoute)?.reduce((acc = [], current) => ([...acc, ...current])) 
    const completedTasks = isLoading ? [] : allTasks.filter(c => c.completed)
    const pendingTasks = isLoading ? [] : allTasks.filter(c => !c.completed)
    const nextTask = pendingTasks[0]
    const onClick = () => {
        onNextTask(nextTask)
    }
    return <div style={styles.progressDashboard}>
        <div style={styles.titleContainer}>
            <div style={styles.title}> Tu Progreso en la Ruta </div>
            <div style={styles.detail}>  Sigue el camino para completar todas las actividades </div>
        </div>
        <div style={styles.tasksProgress}>
            <div key={uuidv4()} style={styles.tasksProgressDetail}>
                <div style={{
                    ...styles.icon,
                    backgroundColor: "rgb(22 163 74 / .2)"
                }}><CompletedTasksIcon color="rgb(22 163 74)"/></div>
                <div style={{
                    ...styles.detailNumber,
                    color: 'rgb(22 163 74)',
                }}>
                    {completedTasks.length}
                </div>
                <div>Completadas</div>
            </div>
            <div key={uuidv4()} style={styles.tasksProgressDetail}>
                <div style={{
                    ...styles.icon,
                    backgroundColor: "rgb(37 99 235 / .2)"
                }}><PendingTasksIcon /></div>
                <div style={{
                    ...styles.detailNumber,
                    color: 'rgb(37 99 235)',
                }}>
                    {pendingTasks.length}
                </div>
                <div>Pendientes</div>
            </div>
            <div key={uuidv4()} style={styles.tasksProgressDetail}>
                <div style={{
                    ...styles.icon,
                    backgroundColor: "rgb(50 50 50 / .2)"
                }}><AllTasksIcon /></div>
                <div style={styles.detailNumber}>
                    {allTasks.length}
                </div>
                <div>Total</div>
            </div>
        </div>
        <div style={{
            ...styles.generalProgress,
            ...styles.bold
        }}>
            <div >Progreso General</div>
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
            }}>
                0%
            </div>
            <div styles={styles.generalProgressBar}>
                <LinearProgress variant="determinate" value={completedTasks.length * 100 / allTasks.length} />
            </div>
        </div>
        <div style={styles.nextTask}>
            <div style={{
                display: 'grid', 
                gridTemplateColumns: '1fr 5fr'
            }}>
                <div><PendingTasksIcon /></div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={styles.bold}> Siguiente Actividad: </div>
                    <div style={{ fontWeight: 500 }}>
                        {nextTask ? nextTask?.title : 'No tienes actividades Pendientes'}
                    </div>
                </div>
            </div>
            <button onClick={onClick} disabled={!nextTask}>
                Comenzar {'>'}
            </button> 
        </div>
    </div>
}

//export default withStyles(styles)(ProgressDashboard);