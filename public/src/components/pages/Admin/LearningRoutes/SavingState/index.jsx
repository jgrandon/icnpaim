import React from 'react'
import * as styles from './SavingState.module.css'

const STATES = {
    clean: {
        text: 'No se han hecho cambios',
        className: 'clean',
        icon: null,
    },
    touched: {
        text: 'Cambios sin guardar ...',
        className: 'touched',
        icon: '●',
    },
    saving: {
        text: 'Guardando...',
        className: 'saving',
        icon: (
            <span className='inline-block animate-spin mr-1 border-2 border-current border-t-transparent rounded-full h-3 w-3' />
        ),
    },
    saved: {
        text: 'Cambios guardados',
        className: 'saved',
        icon: '✓',
    },
    error: {
        text: 'Error al guardar cambios',
        className: 'error',
        icon: '⚠',
    },
}

export default function SavingState ({ state }) {

    const currentState = STATES[state]
    return (
        <div className={styles.wrapper}>
            <div className={styles[currentState.className]}
            >{currentState.icon} {currentState.text}</div>
        </div>
    )
}