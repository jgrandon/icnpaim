import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Typography,
    Box,
    Accordion,
    AccordionDetails,
    AccordionSummary,
} from '@material-ui/core';
import { 
  School
} from '@material-ui/icons'
import ContentCard from '../../organisms/contentCard/'
import { v4 as uuidv4 } from 'uuid'


export default function DashboardUnits (props) {
    //const { units } = props
    const [selectedUnitId, setSelectedUnitId] = useState(null)

    const handleAccordionChange = (panel) => (e, isExpanded) => {
        console.log('handleAccordionChange')
        setSelectedUnitId(isExpanded ? panel : false )
    }

    useEffect(() => {
        const now = new Date().getTime();
        const notExpiredUnits = props.units
            ?.filter(u => u.expiresAt > now)
            ?.sort((a,b) => a.expiresAt - b.expiresAt)
        console.log('useEffect notExpiredUnits', notExpiredUnits)
        const activeUnit = notExpiredUnits[0]
        console.log('useEffect activeUnit', activeUnit)
        setSelectedUnitId(activeUnit.id)
    }, [])

    return (
    <div style={{
        width: isMobile ? 'fit-content' : 'unset',
        maxWidth: isMobile ? 'unset' :'800px',
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        gap: '100px'
    }}>
        {props.units.map((unit, unitIndex) => (
        <Accordion
            key={uuidv4()}
            expanded={selectedUnitId === unit.id}
            onChange={handleAccordionChange(unit.id)}
            style={{
                width: 'stretch'
            }}
        >
            <AccordionSummary style={{
            display: 'flex',
            justifyContent: 'space-between',
            border: '2px rgb(229 231 235f)',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            alignItems: 'center',
            boxShadow: '1px 2px 6px 3px rgb(0 0 0 / .15)'
            }}>
                <div style={{
                    width: '3rem',
                    height: '3rem',
                    border: `1px solid ${unit.color ?? 'gray'}`,
                    borderRadius: '999px',
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <School style={{
                        width: 'calc(3rem * 0.7)',
                        height: 'calc(3rem * 0.7)'
                    }}/>
                </div>
                <div>
                    <Typography
                        variant="h4"
                        style={{fontSize: '1.25rem'}}
                    >{unit.name}</Typography>
                    <Typography
                        variant="h6"
                        style={{fontSize: '0.85rem'}}
                    >{unit.description}</Typography>
                </div>
                <div>
                    {unit.studentLearningRoute?.length} actividades
                </div>      
            </AccordionSummary>

            <AccordionDetails>
                {!unit.unitGrade
                    ? <Typography variant="h6" style={{
                        color: 'black',
                        margin: '20px 0px 0px 0px'
                        }}>
                        Aun no tienes nota de evaluación para esta unidad
                        </Typography>
                    : null
                }

                <Box 
                key={uuidv4()}
                style={{ padding: 10 }}
                >
                    {unit.studentLearningRoute?.map((card, index) => (
                        <ContentCard
                        ref={el => props.cardsRef.current[unitIndex][index].current = el}
                        key={uuidv4()}
                        card={card}
                        onClick={(e) => props.notifyContentProgress(e,unit, card)}
                        unit={unit}
                        />
                    ))}
                </Box>

            </AccordionDetails>



        </Accordion>
    ))}
    </div>)
}