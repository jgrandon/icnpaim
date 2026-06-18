import React, { useState } from 'react'
import MultiNodeSlider from './MultiPickSlider'
import SettingsIcon from '@material-ui/icons/Settings'
import TooltipIconButton from '../../../organisms/TooltipIconButton'
import Modal from '@material-ui/core/Modal'
import * as styles from './learningRoutes.module.css'
import Grid from '@material-ui/core/Grid'
import VerticalTabs from '../../../organisms/VerticalTabs'
import ContentPicker from './contentPicker'
import { v4 as uuidv4 } from 'uuid'


export default function LearningRoutesAdmin ({ unitId }) {
    const [ isModalOpen, setModalOpen ] = useState(false)
    const [ learningRoutes, setLearningRoutes ] = useState([])
    const [ selectedLR, setSelectedLR ] = useState(null) // Learning Route shown in modal

    const closeModal = () => setModalOpen(false)
    const openModal = () => setModalOpen(true)

    const handleSettingsAccept = (data) => {
        console.log('handleSettingsAccept => data', data)
        const newLR = data.map(d => {
            const previousLR = learningRoutes.filter(lr => lr.level == d.level)
            if (!previousLR) {
                return d
            }
            return {
                ...d,
                unitId,
                contents: previousLR.contents ?? []
            }
        })
        console.log('handleSettingsAccept => newLR', newLR)
        setLearningRoutes(newLR)
        closeModal()
    }

    return (
        <div>
            <Grid container
                alignContent='space-between'
            >
                
                <TooltipIconButton
                    title='Configurar Rutas Aprendizaje'
                    onClick={() => {
                        setSelectedLR(null)
                        openModal()
                    }}
                >
                    <SettingsIcon 
                        style={{
                            color: 'white',
                            backgroundColor: 'gray'
                        }}
                    />
                </TooltipIconButton>
            </Grid>

            <VerticalTabs>
                {
                    learningRoutes.map(lr => (
                        <div key={uuidv4()}
                            data-title={`Nivel ${lr.level}`}
                        >
                            <div onClick={() => setSelectedLR(lr)}>
                                <TooltipIconButton
                                    title='Configurar Rutas Aprendizaje'
                                    onClick={openModal}
                                >
                                    <SettingsIcon 
                                        style={{
                                            color: 'white',
                                            backgroundColor: 'gray'
                                        }}
                                    />
                                </TooltipIconButton>
                            </div>
                            { lr.contents.map(c => {
                                <div>{c.title}</div>
                            })}
                        </div>
                    ))
                }
            </VerticalTabs>
            

            <Modal
                open={isModalOpen}
                className={styles.modal}
                onClose={closeModal}
                aria-labelledby='modal-title'
                aria-describedby='modal-description'
            >
                <div className={styles.modalContent}>
                    {
                        selectedLR 
                            ? (
                                <ContentPicker learningRoute={selectedLR}/>
                            ) 
                            : (<MultiNodeSlider onAccept={handleSettingsAccept}/>)
                    }
                </div>
            </Modal>
        </div>
    )

}
