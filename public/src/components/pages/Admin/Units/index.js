import React, { useState, useEffect } from 'react'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
// import Accordion from '@material-ui/core/Accordion'
// import AccordionDetails from '@material-ui/core/AccordionDetails'
// import AccordionSummary from '@material-ui/core/AccordionSummary'
import {
    Card,
    CardContent,
    Box,
    Button,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography
} from '@material-ui/core'
//import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'

import SettingsIcon from '@material-ui/icons/Settings'
import Unitform from './unitForm'
import Modal from '../../../organisms/Modal'
import ProgressReport from '../ProgressReport'
import { v4 as uuidv4 } from 'uuid'
import Sorter from './sorter'
import API from '../../../../services/units'
import * as styles from './units.module.css'
import Loading from '../../../molecules/loading'

const theme = createTheme({
    palette: {
        primary: {
            main: '#ec622b',
            contrastText: '#ffffff', 
        },
        secondary: {
            main: '#07111d',
            contrastText: '#fff',
        }
    },
})

export default function UnitsAdmin () {
    const deleteSession = () => {
        const params = new URLSearchParams(window.location.search)
        const nonce =  params.get('nonce')
    
        fetch('/end-session', {
            method: 'POST',
            body: JSON.stringify({
                nonce,
                timestamp: Date.now()
            }),
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
        })
    }

    useEffect(() => {
        window.addEventListener('beforeunload', deleteSession)
        return () => {
            window.removeEventListener('beforeunload', deleteSession)
        }
    }, [])
    
    return (
        <ThemeProvider theme={theme}>
            <Admin />
        </ThemeProvider>
    )
}


function Admin() {
    const [ isModalOpen, setModalOpen ] = useState(false)
    const [ isProgressReportOpen, setProgressReportOpen ] = useState(false)
    const [ units, setUnits ] = useState([])
    const [ subject, setSubject ] = useState([])
    const [ selectedUnitId, setSelectedUnitId ] = useState(null)
    const [ loading, setLoading ] = useState(false)


    useEffect(() => {
        loadUnits()
    }, [])

    const loadUnits = async () => {
        setLoading(true)
        try {
            const data = await API.getAll()
            setUnits(data.units)
            setSubject(data.subject)
        } catch (err) {
            console.error('Fail to load units', err)
        } finally {
            setLoading(false)
        }
    }


    const handleAccordionChange = (panel) => (e, isExpanded) => {
        setSelectedUnitId(isExpanded ? panel : false )
    }

    const handleUnitsUpdate = (action, updatedUnits) => {
        console.log('handleUnitsUpdate', {action,updatedUnits})
        /*
        let newState = []
        const sort = (u, index) => ({ ...u, position: index })
        if (action == 'added') {
            console.log('added')
            setUnits(prev => [ ...prev, updatedUnit ].map(sort))
            setModalOpen(false)
        } if (action == 'updated') {
            console.log('updated')
            setUnits(prev => prev.map((u) => (u.id === selectedUnitId ? updatedUnit : u)).map(sort))
        } if (action == 'removed') {
            console.log('removed')
            setUnits(prev => prev.filter((u) => u.id !== updatedUnit.id).map(sort))
        }
        */
        if (action == 'canceled') {
            setModalOpen(false)
            return
        } else if (action == 'added') {
            setModalOpen(false)
        }
        console.log('handleUnitsUpdate => updatedUnits', updatedUnits)
        setUnits(updatedUnits.map((u, index) =>( { ...u, position: index, order: index })))
        // setUnits( newState.sort((a,b) => a.position - b.position) )
    }

    return (
        <div className={styles.admin}>

            <Card className={styles.header} elevation={4}>
                <CardContent>
                    <Box display='flex' alignItems='center' justifyContent='space-between'>
                        <Box display='flex' alignItems='center' style={{ gap: 16 }}>
                            <SettingsIcon fontSize='large' />
                            <Box>
                                <Typography variant='h5'>
                                    {subject.name}
                                </Typography>
                                {/*}
                                <Typography variant='subtitle1' style={{ opacity: 0.9 }}>
                                {selectedCourse ? selectedCourse.name : 'Plataforma de Aprendizaje ICNPAIM'}
                                </Typography>
                                */}
                            </Box>
                        </Box>
                        <Box textAlign='center'>
                            <Typography variant='h4' style={{ fontWeight: 'bold' }}>
                                {units.length}
                            </Typography>
                            <Typography variant='body2' style={{ opacity: 0.9 }}>
                                Unidades
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {loading ? (
                <Loading text='Cargando Unidades...' />
            ) : ( <div>
                <div className={styles.title}>
                    <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        startIcon={<AddIcon />}
                        onClick={() => setModalOpen(true)}
                        style={{ height: '30px' }}
                    >
                        Agregar Unidad
                    </Button>
                </div>
                {units.length==0
                    ? (<div className={styles.noUnitsLabel}>Este curso no tiene unidades</div>)
                    : <Sorter
                        units={units}
                        setUnits={setUnits}
                        selectedUnitId={selectedUnitId}
                        setSelectedUnitId={setSelectedUnitId}
                        handleUnitsUpdate={handleUnitsUpdate}
                    />
                }
                <Button onClick={() => setProgressReportOpen(true)}>Reporte Progreso</Button>
            </div> )}
            <Modal
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                title='Nueva Unidad'
            >
                <Unitform
                    unit={{}}
                    updateCallback={handleUnitsUpdate}
                    cancel
                />
            </Modal>
            <Modal
                open={isProgressReportOpen}
                onClose={() => setProgressReportOpen(false)}
                title={`${subject.name} > Progreso Estudiantes`} 
            >
                <ProgressReport />
            </Modal>
        </div>
    )
}