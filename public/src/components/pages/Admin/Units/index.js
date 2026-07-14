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
import Modal from '../../../organisms/Modal'
import { v4 as uuidv4 } from 'uuid'
import VerticalTabs from '../../../organisms/VerticalTabs'
import Unitform from './unitForm'
import ContentsAdmin from '../ContentsAdmin'
import LearningRoutesAdmin from '../LearningRoutes'
import API from '../../../../services/units'
import * as styles from './units.module.css'

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
    return (
        <ThemeProvider theme={theme}>
            <Admin />
        </ThemeProvider>
    )
}

function Admin() {
    const [ isModalOpen, setModalOpen ] = useState(false)
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

    const handleUnitsUpdate = (action, updatedUnit) => {
        console.log('handleUnitsUpdate', {action,updatedUnit})
        let newState = []
        if (action == 'added') {
            console.log('added')
            newState = [ ...units, updatedUnit ]
            setModalOpen(false)
        } if (action == 'updated') {
            console.log('updated')
            newState = units.map((u) => (u.id === selectedUnitId ? updatedUnit : u))
        } if (action == 'removed') {
            console.log('removed')
            newState = units.filter((u) => u.id !== updatedUnit.id)
        } if (action == 'canceled') {
            setModalOpen(false)
            return
        }
        setUnits( newState.sort((a,b) => a.position - b.position) )
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


            {loading ? (
                <p>Loading units...</p>
            ) : (<div>
                {units.length==0
                    ? (<div className={styles.noUnitsLabel}>Este curso no tiene unidades</div>)
                    : units.map((unit) => (
                        <Accordion
                            key={uuidv4()}
                            expanded={selectedUnitId === unit.id}
                            onChange={handleAccordionChange(unit.id)}
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
                    ))
                }
            </div>
            )}

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
        </div>
    )
}