import React, { useState } from 'react'
import MultiNodeSlider from './MultiPickSlider'
import SettingsIcon from '@material-ui/icons/Settings'
import TooltipIconButton from '../../../organisms/TooltipIconButton'
import Modal from '../../../organisms/Modal'
import * as styles from './learningRoutes.module.css'
import Grid from '@material-ui/core/Grid'
import VerticalTabs from '../../../organisms/VerticalTabs'
import ContentSelector from './ContentSelector'
import { v4 as uuidv4 } from 'uuid'
import ContentSorter from './ContentSorter'

export default function LearningRoutesAdmin ({ unit }) {
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
                unitId: unit.id,
                contents: previousLR.contents ?? []
            }
        })
        console.log('handleSettingsAccept => newLR', newLR)
        setLearningRoutes(newLR)
        closeModal()
    }

    const handleContentsAccept = (updatedLevel, selectedContents) => {
        setLearningRoutes(prev => {
            const updatedLR = prev.find(lr => lr.level == updatedLevel)
            const otherLR = prev.filter(lr => lr.level != updatedLevel)
            // remove all non selected contents and sort
            const oldContents = updatedLR.contents.filter(
                c => !!( selectedContents.find(sc => sc.id == sc.id) )
            ).sort((a, b) => (a.order - b.order))

            // remove from selected all prev contents
            const newContents = selectedContents.filter(
                sc => !( oldContents.find(oc => oc.id == sc.id)) 
            )

            // add remaining contents at the end
            const updatedContents = [ 
                ...oldContents, 
                ...newContents
            ].map((nc, index) => ({ ...nc, order: index })) // assign order attr to all new contents
            
            // update Learning Routes
            const allLR = [
                ...otherLR,
                { ...updatedLR, contents: updatedContents}
            ].sort((a, b) => (a.level - b.level))
            console.log('handleContentsAccept => setLearningRoutes', allLR)
            return allLR
        })

        closeModal()
        // setSelectedLR(null)
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

                            <ContentSorter contents={lr.contents} />
                        {/*}
                            <ReactSortable list={state} setList={setState}>
                                { lr.contents.map(c => (
                                    {state.map((item) => (
                                    <div key={item.id}>
                                        <Content
                                            key={uuidv4()}
                                            content={c}
                                            onClick={() => {}}
                                        />
                                    </div>
                                    ))}
                                ))}
                            </ReactSortable>
                            */}
                        </div>
                    ))
                }
            </VerticalTabs>

            <Modal
                open={isModalOpen}
                onClose={closeModal}
                title={selectedLR
                    ? `${unit.name} > Ruta Nivel ${selectedLR.level}:`
                    : 'Rango de notas:'}
            >
                {
                    selectedLR 
                        ? (
                            <ContentSelector
                                learningRoute={selectedLR}
                                onAccept={handleContentsAccept}
                                onCancel={closeModal}
                            />
                        ) 
                        : (<MultiNodeSlider onAccept={handleSettingsAccept}/>)
                }
            </Modal>
        </div>
    )

}
