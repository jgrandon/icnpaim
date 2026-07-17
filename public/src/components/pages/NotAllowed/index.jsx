import React from 'react'
import * as styles from './NotAllowed.module.css'

const NotAllowed = ({ onGoBack, onGoHome }) => {
    return (
        <div className={styles.container}>
            <div className={styles.iconContainer}>
                <svg 
                    xmlns='http://www.w3.org/2000/svg' 
                    fill='none' 
                    viewBox='0 0 24 24' 
                    strokeWidth={1.5} 
                    stroke='currentColor' 
                    className={styles.icon}
                >
                    <path 
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                    />
                </svg>
            </div>

            {/* Main Content */}
            <h1 className={styles.title}>
              Acceso Denegado
            </h1>
            
            <p className={styles.errorCode}>
              Error 403 • Area Restringida
            </p>
            
            <p className={styles.description}>
              Lo sentimos, no tienes los permisos necesarios para ver esta pagina. Si crees que esto es un error contactate con el administrador.
            </p>

            <div className={styles.buttonGroup}>
                <button
                    onClick={onGoBack || (() => window.history.back())}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                >
                  Atras
                </button>
              
                <button
                    onClick={onGoHome || (() => window.location.href = '/')}
                    className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Home
                </button>
            </div>
        </div>
    )
}

export default NotAllowed