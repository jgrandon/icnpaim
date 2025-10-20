import React from 'react'

const styles = {
    progressDashboard : {
        display: 'grid',
    },
    titleContainer: {
        display: 'flex',
        flexDirection: 'column'
    },
    title: {
        fontWeight: '700',
        fontSize: '1.875rem',
        lineHeight: '2.25rem',
    },
    tasksProgress: {
        display: 'flex'
    },
    tasksProgressDetail: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center'
    },
    generalProgress: {
        display: 'grid',
    },
    nextTask: {
        display: 'grid',
        color: 'rgb(36, 97, 233)',
        border: '1px solid rgb(191 219 254)'
    }
}

export default function ProgressDashboard(props) {
    return <div style={styles.progressDashboard}>
        <div style={styles.titleContainer}>
            <div style={styles.title}> Tu Progreso en la Ruta </div>
            <div>  Sigue el camino para completar todas las actividade </div>
        </div>
        <div style={styles.tasksProgress}>
            <div style={styles.tasksProgressDetail}>
                <div>icon</div>
                <div>0</div>
                <div>Completadas</div>
            </div>
            <div>
                <div>icon</div>
                <div>21</div>
                <div>Pendientes</div>
            </div>
            <div>
                <div>icon</div>
                <div>21</div>
                <div>Total</div>
            </div>
        </div>
        <div style={styles.generalProgress}>
            <div>Progreso General</div>
            <div>
                0%
            </div>
            <div>
               Barra
            </div>
        </div>
        <div style={styles.nextTask}>
            <div>Icon</div>
            <div> SiguienteActividad: </div>
            <div> Ver Clase 1 </div>
            <button>
                Comenzar
                <div> {'>'} </div>
            </button> 
        </div>
    </div>
}

//export default withStyles(styles)(ProgressDashboard);