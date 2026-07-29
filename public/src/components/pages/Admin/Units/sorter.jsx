import React, { useState, useEffect, useRef } from 'react'
import { ReactSortable } from 'react-sortablejs'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary
} from '@material-ui/core'
import DragHandleIcon from '@material-ui/icons/DragHandle';

import VerticalTabs from '../../../organisms/VerticalTabs'
import Unitform from './unitForm'
import ContentsAdmin from '../ContentsAdmin'
import LearningRoutesAdmin from '../LearningRoutes'
//import Content from '../../Content'
import { v4 as uuidv4 } from 'uuid'
import * as styles from './units.module.css'
import API from '../../../../services/units'
import SavingState from '../LearningRoutes/SavingState';

export default function UnitsSorter (props) {
    const {
        units, 
        selectedUnitId,
        setSelectedUnitId,
        handleUnitsUpdate,
        setUnits
    } = props
    const [ sorted, setSorted ] = useState(units)
    const [ savingState, setSavingState ] = useState('clean')
    const savingTimerRef = useRef(null)
    
    useEffect(() => {
        setSorted(units)
    },[units])

    useEffect(() => {
        return () => {
            if (savingTimerRef.current) clearTimeout(savingTimerRef.current)
        }
    }, [])

    const handlePositionChange = async (data) => {
        setSavingState('touched')
        if (savingTimerRef.current) clearTimeout(savingTimerRef.current)
        savingTimerRef.current = setTimeout(async () => {
            const updateData = [ ...units ]
            console.log('5 seconds have passed!', data)
            await updatePositions([...data])
        }, 5000)
    }

    const updatePositions = async (data) => {
        setSavingState('saving')
        console.log('updatePositions', data)
        const allUnits = await API.updateUnitsPositions(data)
        setUnits(allUnits)
        setSavingState('saved')
    }

    const handleAccordionChange = (panel) => (e, isExpanded) => {
        console.log('handleAccordionChange')
        setSelectedUnitId(isExpanded ? panel : false )
    }

    return (
        <div className={styles.wrapper}>
            <ReactSortable 
                list={sorted}
                setList={setSorted}
                onSort={() => {
                    console.log('onSort', sorted)
                    const data = sorted.map((d,index) =>  ({ ...d, position: index + 1 }))
                    handlePositionChange(data)
                }}
                onChange={() => console.log('onChange')}
                onUpdate={() => console.log('onUpdate')} 
                onStart={() => console.log('onStart')} 
                onEnd={() => console.log('onEnd')}
                handle={`.${styles.sortHandle}`}
            >
                {sorted.map((unit) => (
                    <div key={unit.id} className={styles.sortElementWrapper}>
                        <div className={styles.sortHandle}>
                            <DragHandleIcon
                                className={styles.handleIcon}
                                style={{
                                    display: selectedUnitId ? 'none' : 'unset'
                                }}
                            />
                        </div>
                        <Accordion
                            key={uuidv4()}
                            expanded={selectedUnitId === unit.id}
                            onChange={handleAccordionChange(unit.id)}
                            style={{
                                width: 'stretch'
                            }}
                        >
                            <AccordionSummary className={styles.accordion}>
                                <div 
                                    className={styles.colorIndicator}
                                    style={{
                                        backgroundColor: unit.color
                                    }}
                                ></div>
                                {unit.name}
                            </AccordionSummary>
                            <AccordionDetails>
                                <VerticalTabs orientation='horizontal'>
                                    <div data-title='Datos'
                                        className={styles.tabWrapper}
                                    >
                                        <Unitform
                                            unit={unit}
                                            updateCallback={handleUnitsUpdate}
                                        />
                                    </div>
                                    <div data-title='Contenidos'
                                        className={styles.tabWrapper}
                                    >
                                        <ContentsAdmin unitId={unit.id}/>
                                    </div>
                                    <div data-title='Rutas Aprendizaje'
                                        className={styles.tabWrapper}
                                    >
                                        <LearningRoutesAdmin unit={unit} />
                                    </div>
                                </VerticalTabs>
                            </AccordionDetails>
                        </Accordion> 
                    </div>
                ))}
            </ReactSortable>
            <SavingState state={savingState}/>
        </div>
    )
}