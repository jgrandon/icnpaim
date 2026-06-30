import React, { useState, useRef, useEffect } from 'react'
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
import API from '../../../../services/learningRoutes'
import SavingState from './SavingState'

export default function LearningRoutesAdmin (props) {
    const [ isModalOpen, setModalOpen ] = useState(false)
    const [ learningRoutes, setLearningRoutes ] = useState([])
    const [ selectedLR, setSelectedLR ] = useState(null) // Learning Route shown in modal
    const [ savingState, setSavingState ] = useState('clean')
    const closeModal = () => setModalOpen(false)
    const openModal = () => setModalOpen(true)
    const savingTimerRef = useRef(null)

    useEffect(() => {
        loadLearningRoutes()
        return () => {
            if (savingTimerRef.current) clearTimeout(savingTimerRef.current)
        }
    }, [])

    const loadLearningRoutes = async () => {
        const data = await API.getLearningRoutes(props.unit.id)
        setLearningRoutes(data)
    }

    const handleSchemaUpdate = (data) => {
        console.log('handleSchemaUpdate => data', data)
        const newLR = data.map(d => {
            const previousLR = learningRoutes.filter(lr => lr.level == d.level)
            if (!previousLR) {
                return d
            }
            return {
                ...d,
                unitId: props.unit.id,
                contents: previousLR.contents ?? []
            }
        })
        console.log('handleSchemaUpdate => newLR', newLR)
        saveSchemaChanges(newLR)   
        closeModal()
    }

    const handleAddOrRemove = (updatedLevel, selectedContents) => {
        setLearningRoutes(prev => {
            const updatedLR = prev.find(lr => lr.level == updatedLevel)
            const otherLR = prev.filter(lr => lr.level != updatedLevel)
            // remove all non selected contents and sort
            const oldContents = updatedLR.contents.filter(
                c => !!( selectedContents.find(sc => sc.id == c.id) )
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
                { ...updatedLR, contents: updatedContents }
            ].sort((a, b) => (a.level - b.level))
            console.log('handleAddOrRemove => setLearningRoutes', allLR)

            setSelectedLR({ ...updatedLR, contents: updatedContents })
            return allLR
        })

        saveContentChanges({
            unitId: props.unit.id,
            level: selectedLR.level,
            contents: selectedLR.contents
        })
        closeModal()
        // setSelectedLR(null)
    }


    const handleOrderUpdate = async (contents) => {
        const { level } = selectedLR
        console.log('onchange', {level, contents})
        setSavingState('touched')
        if (savingTimerRef.current) clearTimeout(savingTimerRef.current)
        savingTimerRef.current = setTimeout(async () => {
            console.log('5 seconds have passed!')
            await saveContentChanges({
                unitId: props.unit.id,
                level,
                contents
            }
            console.log('5 seconds have passed!', data)
            await saveContentChanges(data)
        }, 5000)
    }

    const saveContentChanges = async (data) => {
        alert('saveContentChanges')
        try {
            setSavingState('saving')
            await API.updateContents(data)
            setSavingState('saved')
        } catch (error) {
            console.warn('updateContents API ERROR', error)
            setSavingState('error')
        }
    }

    const saveSchemaChanges = async (data) => {
        alert('saveSchemaChanges')
        const unitId = props.unit.id
        try {
            //setSavingState('saving')
            const updatedLR = await API.updateSchema(unitId, data)
            setLearningRoutes(updatedLR)
            //setSavingState('saved')
        } catch (error) {
            console.warn('updateSchema API ERROR', error)
            //setSavingState('error')
        }
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
                        if (savingTimerRef.current) clearTimeout(savingTimerRef.current)
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

                            <ContentSorter
                                contents={lr.contents}
                                onChange={handleOrderUpdate}
                            />

                            <SavingState state={savingState}/>
                        </div>
                    ))
                }
            </VerticalTabs>

            <Modal
                open={isModalOpen}
                onClose={closeModal}
                title={selectedLR
                    ? `${props.unit.name} > Ruta Nivel ${selectedLR.level}:`
                    : 'Rango de notas:'}
            >
                {
                    selectedLR 
                        ? (
                            <ContentSelector
                                learningRoute={selectedLR}
                                onAccept={handleAddOrRemove}
                                onCancel={closeModal}
                            />
                        ) 
                        : (<MultiNodeSlider onAccept={handleSchemaUpdate}/>)
                }
            </Modal>
        </div>
    )

}
