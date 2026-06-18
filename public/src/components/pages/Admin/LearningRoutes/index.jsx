import React, { useState } from 'react'
import MultiNodeSlider from './MultiPickSlider'
import SettingsIcon from '@material-ui/icons/Settings'
import TooltipIconButton from '../../../organisms/TooltipIconButton'
import Modal from '@material-ui/core/Modal'
import * as styles from './learningRoutes.module.css'

export default function LearningRoutesAdmin ({ unitId }) {
    const [ isModalOpen, setModalOpen ] = useState(false)
    
    const handleSettingsAccept = (data) => {
        console.log('handleSettingsAccept', data)
    }

    return (
        <div>
            <TooltipIconButton
                title='Configurar Rutas Aprendizaje'
                onClick={() => setModalOpen(true)}
            >
                <SettingsIcon 
                    style={{
                        color: 'white',
                        backgroundColor: 'gray'
                    }}
                />
            </TooltipIconButton>
            <Modal
                open={isModalOpen}
                className={styles.modal}
                onClose={() => setModalOpen(false)}
                aria-labelledby='simple-modal-title'
                aria-describedby='simple-modal-description'
            >
                <div className={styles.modalContent}>
                    <MultiNodeSlider onAccept={handleSettingsAccept}/>
                </div>
            </Modal>
        </div>
    )

}
