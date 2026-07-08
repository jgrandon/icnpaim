import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Slider from '@material-ui/core/Slider'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Tooltip from '@material-ui/core/Tooltip'
import Grid from '@material-ui/core/Grid'

import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import SaveIcon from '@material-ui/icons/Save'

import { v4 as uuidv4 } from 'uuid'
import * as styles from './learningRoutes.module.css'

const __DEFAULT_MIN_GRADE = 1
const __DEFAULT_MAX_GRADE = 7
const ___MAX_NODES = 7

const useStyles = makeStyles((theme) => ({
    root: {
        width: 400,
    },
    controls: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: '20px',
    },
    /*
    icon: {
        background
    },
    */
    nodeList: {
        marginTop: '15px',
        fontSize: '0.9rem',
        color: '#555',
    }
}))

const __DEFAULT_ROUTES = [
    {level: 1, minGrade: 1, maxGrade: 2.5},
    {level: 2, minGrade: 2.5, maxGrade: 5},
    {level: 3, minGrade: 5, maxGrade: 7},
]

export default function MultiNodeSlider(props) {
    const classes = useStyles()
    
    const  [ nodes, setNodes ] = useState(props.breakPoints ?? [ 2.5, 5.0 ])
    const  [ routes, setRoutes ] = useState(props.learningRoutes ?? __DEFAULT_ROUTES)

    const handleSliderChange = (event, newValue) => {
        setNodes(newValue)
        calculateRoutes(newValue)
    }

    const addNode = () => {
        if (nodes.length >= ___MAX_NODES - 1) {
            alert('No puedes agregar mas rutas de aprendizaje')
            return
        }
        const newNode = parseFloat((Math.random() * (7 - 1) + 1).toFixed(2))
        const updatedNodes = [ ...nodes, newNode ].sort((a, b) => a - b)
        setNodes(updatedNodes)
        calculateRoutes(updatedNodes)
    }

    const resetSlider = () => {
        if (nodes.length==1) {
            return 
        }
        const remainingNodes = nodes.splice(0, nodes.length-1)
        setNodes(remainingNodes)
        calculateRoutes(remainingNodes)
    }

    const calculateRoutes = (breakPoints) => {
        const newRoutes = []
        console.log('calculateRoutes => start', breakPoints)
        for (let i = 0; i <= breakPoints.length; i++) {
            console.log('calculateRoutes => for')
            const isFirst = i == 0
            const isLast = i == breakPoints.length
            let minGrade, maxGrade

            if (isFirst) {
                console.log('calculateRoutes => isFirst')
                minGrade = __DEFAULT_MIN_GRADE
                maxGrade = breakPoints[i]
            }
            if (isLast) {
                console.log('calculateRoutes => isLast')
                minGrade = breakPoints[i-1]
                maxGrade = __DEFAULT_MAX_GRADE
            }
            if (!isFirst && !isLast) { //middle position
                console.log('calculateRoutes => isMiddle')
                minGrade = breakPoints[i-1]
                maxGrade = breakPoints[i]
            }
            const level = i+1
            console.log('calculateRoutes => add', {level, minGrade, maxGrade})
            newRoutes.push({level, minGrade, maxGrade})
        }
        setRoutes(newRoutes)
    }

    const getTableData = () => {
        const data = []
        for(let i=0; i < ___MAX_NODES; i++) {
            const currentRow = routes[i]
            if (!currentRow) {
                data.push({ level: i+1, minGrade: '-', maxGrade: '-'})
            } else data.push(currentRow)
        }
        return data
    }

    const disabledRouteStyles = {
        background: '#d5d5d5',
        fontWeight: '300',
        color: '#b7b7b7'
    }

    return (
        <div className={classes.root}>
        
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '20px',
                padding: '20px 0px'
            }}>
                <div style={{ width: 'stretch'}}> 
                    <Slider
                        value={nodes}
                        onChange={handleSliderChange}
                        aria-labelledby='multi-node-slider-label'
                        step={0.1} // Allows fractional floating point adjustments
                        min={1.0}
                        max={7.0}
                        valueLabelDisplay='auto' // Shows value bubble on hover/drag
                    />
                </div>
                <div>
                    <ButtonGroup variant='contained' color='primary' aria-label='contained secondary button group'>
                        <Button aria-label='add' onClick={addNode}>
                            <AddIcon />
                        </Button>
                        <Button aria-label='reset' onClick={resetSlider}>
                            <RemoveIcon />
                        </Button>
                    </ButtonGroup>
                    {/*
                    <Tooltip title='Agregar Ruta'>
                        <IconButton aria-label='add' onClick={addNode}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Quitar ultima ruta'>
                        <IconButton aria-label='reset' onClick={resetSlider}>
                            <RemoveIcon />
                        </IconButton>
                    </Tooltip>
                    */}
                </div>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Ruta Aprendizaje</th>
                        <th>Nota máxima</th>
                        <th>Nota mínima</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        getTableData().map(r => (
                            <tr 
                                key={uuidv4()} 
                                style={ r.minGrade == '-'
                                    ? disabledRouteStyles
                                    : {}
                                }
                            >
                                <td>{`Nivel ${r.level}`}</td>
                                <td>{r.minGrade}</td>
                                <td>{r.maxGrade}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            
            <div className={classes.controls}>
                <Button
                    onClick={() => props.onAccept(routes)}
                    variant='contained'
                    color='primary'
                    startIcon={<SaveIcon/>}
                >
                    Guardar
                </Button>
            </div>

            {/*}
            <div className={classes.nodeList}>
                <strong>Current Output Array:</strong> 
                <code>{JSON.stringify(nodes.map(n => parseFloat(n.toFixed(2))))}</code>
            </div>
            */}

        </div>
    )
}