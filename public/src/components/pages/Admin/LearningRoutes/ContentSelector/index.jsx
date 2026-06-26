import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import SaveIcon from '@material-ui/icons/Save'
import CloseIcon from '@material-ui/icons/Close'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import { v4 as uuidv4 } from 'uuid'
import ContentsAPI from '../../../../../services/contents'
import Content from '../../Content'
import * as styles from './ContentSelector.module.css'


export default function ContentSelector (props) {
    const { learningRoute, onAccept, onCancel } = props
    const [ contents, setContents ]= useState(learningRoute.contents)
    const [ selectedContents, setSelectedContents ] = useState(learningRoute.contents)


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
                prev.filter(sc => sc.id != content.id))
        }
        else {
            setSelectedContents(prev => [ ...prev, content ])
        }
    }

    const isSelected = (content) => {
        return selectedContents.find(sc => sc.id == content.id)
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.list}>
                { contents.map( c => (
                    <div key={uuidv4()}
                        className={`
                            ${styles.selectableRow} 
                            ${isSelected(c) ? styles.selected : ''}
                        `}
                    >
                        <Content
                            content={c}
                            onClick={() => handleClick(c)}
                        />
                    </div>
                )) }
            </div>

            {/*
                <div key={ uuidv4() }
                    className={styles.contentSelectorRow}
                    style={{
                        backgroundColor: isSelected(c) ? 'gray' : 'white'
                    }}
                >
                    <div>{ c.type }</div>
                    <div>{ c.title }</div>
                </div>
            */}
            
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