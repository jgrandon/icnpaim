import React, { useState, useEffect } from 'react'
import ContentsAPI from '../../../../services/contents'
import { v4 as uuidv4 } from 'uuid'
import * as styles from './learningRoutes.module.css'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import SaveIcon from '@material-ui/icons/Save'
import CloseIcon from '@material-ui/icons/Close'

export default function ContentSelector (props) {
    const { learningRoute, onAccept, onCancel } = props
    const [ contents, setContents ]= useState(learningRoute.contents)
    const [ selectedContents, setSelectedContents ] = useState([])


    useEffect(() => {
        loadContents()
    }, [])

    const loadContents = async () => {
        const { unitId } = learningRoute
        const data = await ContentsAPI.getAll(unitId)
        setContents(data)
    }

    const handleClick = (content) => {
        console.log('handleClick', selectedContents, content)
        if (isSelected(content)) {
            setSelectedContents(prev => 
                prev.filter(sc => sc.title != content.title))
        }
        else {
            setSelectedContents(prev => [ ...prev, content ])
        }
    }

    const isSelected = (content) => {
        return selectedContents.find(sc => sc.title == content.title)
    }

    return (
        <div className={styles.contentSelector}>
            { contents.map( c => (
                <div key={ uuidv4() }
                    onClick={() => handleClick(c)}
                    className={styles.contentSelectorRow}
                    style={{
                        backgroundColor: isSelected(c) ? 'gray' : 'white'
                    }}
                >
                    <div>{ c.type }</div>
                    <div>{ c.title }</div>
                </div>
            )) }
            <div className={styles.contentSelectorButtons}>
                <ButtonGroup variant='contained' color='primary' aria-label='contained secondary button group'>
                    <Button
                        aria-label='add'
                        startIcon={<SaveIcon />}
                        onClick={() => onAccept(learningRoute.level, selectedContents)}
                    >
                        Aceptar
                    </Button>
                    <Button
                        aria-label='reset'
                        startIcon={<CloseIcon />}
                        onClick={onCancel}>
                        
                    </Button>
                </ButtonGroup>
            </div>
        </div>
    )
}