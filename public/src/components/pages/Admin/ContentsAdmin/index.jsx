import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal'
import ContentForm from './form'
import * as styles from './contentsAdmin.module.css'
import API from '../../../../services/contents'
import AddIcon from '@material-ui/icons/Add'
import CloseIcon from '@material-ui/icons/Close'
import TooltipIconButton from '../../../organisms/TooltipIconButton'
import Typography from '@material-ui/core/Typography'
import Content from '../Content'
import {Button} from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid'

export default function ContentsAdmin ({ unitId = null }) {
    const [ isModalOpen, setModalOpen ] = useState(false)
    const [ contents, setContents ]= useState([])
    const [ editedContent, setEditedContent ] = useState({})

    useEffect( () => {
        if (unitId) loadContents()
    }, [ unitId ])
    
    const loadContents = async () => {
        const data = await API.getAll(unitId)
        setContents(data)
    }

    const handleContentUpdate = (action, updatedContent) => {
        console.log('handleContentUpdate', {action,updatedContent})
        if (action == 'added') {
            console.log('added')
            setContents([ ...contents, updatedContent ])
        } if (action == 'updated') {
            console.log('updated')
            setContents(contents.map((u) => (u.id === updatedContent.id ? updatedContent : u)))
        } if (action == 'removed') {
            console.log('updated')
            setContents(contents.filter((u) => u.id !== updatedContent.id))
        }
        setEditedContent({})
        setModalOpen(false)
    }

    const handleContentClick = (targetContent) => {
        setEditedContent(targetContent)
        setModalOpen(true)
    }

    return (
        <div>
            <div className={styles.header} >
                <Button
                    startIcon={<AddIcon />}
                    variant={'contained'}
                    color={'primary'}
                    className={styles.addButton}
                    title='Agregar Nuevo Contenido'
                    onClick={() => setModalOpen(true)}
                >Nuevo Contenido</Button>
            </div>
            
            <div className={styles.listContainer}>
                {
                    contents.map((c) => (
                        <Content
                            key={uuidv4()}
                            content={c}
                            onClick={handleContentClick}
                        />
                    ))
                }
            </div>

            <Modal
                open={isModalOpen}
                className={styles.modal}
                onClose={() => setModalOpen(false)}
                aria-labelledby='simple-modal-title'
                aria-describedby='simple-modal-description'
            >
                <div className={styles.modalContent}>
                    <div className={styles.modalTitle}>
                        <div>Contenido</div>
                        <TooltipIconButton
                            title='Cerrar'
                            onClick={() => setModalOpen(false)}
                        >
                            <CloseIcon />
                        </TooltipIconButton>
                    </div>
                    <ContentForm
                        unitId={unitId}
                        content={editedContent}
                        updateCallback={handleContentUpdate}
                    />
                </div>
            </Modal>
        </div>
    )
}