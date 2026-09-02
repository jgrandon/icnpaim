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
import { makeStyles } from '@material-ui/core/styles'
import ContentCard from '../../organisms/contentCard/'
import { v4 as uuidv4 } from 'uuid'

const useStyles = makeStyles((theme) => ({
    accordionSummary: {
        display: 'flex',
        gap: '5px',
        justifyContent: 'space-between',
        border: '2px rgb(229 231 235f)',
        padding: '0.75rem 1.5rem',
        borderRadius: '9999px',
        alignItems: 'center',
        '& .MuiAccordionSummary-content': {
            gap: '15px',
            display: 'grid',
            gridTemplateColumns: '1fr 10fr 2fr'
        },
    },
    unitHeader: {
        width: '3rem',
        height: '3rem',
        borderRadius: '999px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        justifyContent: 'center',
    }
}))

export default function DashboardUnits (props) {
    //const { units } = props
    const classes = useStyles()
    const [selectedUnitId, setSelectedUnitId] = useState(null)
    const isMobile = window.matchMedia('(max-width: 800)').matches


    const handleAccordionChange = (panel) => (e, isExpanded) => {
        console.log('handleAccordionChange')
        setSelectedUnitId(isExpanded ? panel : false )
    }

    useEffect(() => {
        const now = new Date().getTime();
        console.log('useEffect => props.units', props.units)
        if (!!props.units) {
            const notExpiredUnits = props.units
                ?.filter(u => u.expiresAt > now)
                ?.sort((a,b) => a.expiresAt - b.expiresAt)
            console.log('useEffect notExpiredUnits', notExpiredUnits)
            const activeUnit = notExpiredUnits[0]
            console.log('useEffect activeUnit', activeUnit)
            if (!!activeUnit) setSelectedUnitId(activeUnit?.id)
        }
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
                width: 'stretch',
                boxShadow: 'none'
            }}
        >
            <AccordionSummary 
                className={classes.accordionSummary}
                style={{
                    boxShadow: selectedUnitId === unit.id
                        ? `0px 0px 6px 6px ${unit.color ?? 'gray'}`
                        : '1px 2px 6px 3px rgb(0 0 0 / .15)'
                }}    
            >
                <div 
                    className={classes.unitHeader}
                    style={{border: `1px solid ${unit.color ?? 'gray'}`}}
                >
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
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
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