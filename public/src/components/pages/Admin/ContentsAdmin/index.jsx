import React, { useState, useEffect } from 'react'
import { 
    Button,
    IconButton
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import Tooltip from '@material-ui/core/Tooltip'

import ContentForm from './form'
import * as styles from './contentsAdmin.module.css'
import API from '../../../../services/contents'
//import TooltipIconButton from '../../../organisms/TooltipIconButton'
import Content from '../Content'
import Modal from '../../../organisms/Modal'
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

    const handleDelete = async (content) => {
        const ok = confirm(`¿Estas seguro de eliminar el contenido ${content.title}?`)
        if (!ok) return
        console.log('handleRemove')
        await API.delete(unitId, content.id)
        console.log('removed')
        handleContentUpdate('removed', content)
    } 

    return (
        <div>
            <div className={styles.header} >
                <Button
                    startIcon={<AddIcon />}
                    variant={'contained'}
                    color={'primary'}
                    className={styles.addButton}
                    title='Agregar Contenido'
                    size='small'
                    onClick={() => {
                        setEditedContent({})
                        setModalOpen(true)
                    }}
                >Agregar Contenido</Button>
            </div>
            
            <div className={styles.listContainer}>
                {
                    contents.map((c) => (
                        <div
                            key={uuidv4()}
                            className={styles.contentWrapper}
                        >
                            <Tooltip arrow
                                title={'Editar'}
                                placement='bottom'
                            >
                                <IconButton 
                                    color={'primary'}
                                    size='small'
                                    className={styles.editButton}
                                    onClick={() => handleContentClick(c)}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip arrow
                                title={'Quitar'}
                                placement='bottom'
                            >
                                <IconButton 
                                    color={'primary'}
                                    size='small'
                                    className={styles.deleteButton}
                                    onClick={() => handleDelete(c)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                            <Content
                                content={c}
                                onClick={() => {}}
                            />
                        </div>
                    ))
                }
            </div>

            <Modal
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                title='Contenido'
            >
                <ContentForm
                    unitId={unitId}
                    content={editedContent}
                    updateCallback={handleContentUpdate}
                />
            </Modal>
        </div>
    )
}