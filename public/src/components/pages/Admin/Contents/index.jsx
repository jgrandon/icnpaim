import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal'
import ContentForm from './form'
import * as styles from './contents.module.css'
import ContentsList from './list'
import API from '../../../../services/contents'

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
            console.log('removed')
            setContents(contents.filter((u) => u.id !== updatedContent.id))
        } if (action == 'cenceled') {
            console.log('cenceled')
            setContents(contents.filter((u) => u.id !== updatedContent.id))
        }
        setEditedContent({})
        setModalOpen(false)
    }

    const handleEdit = (targetContent) => {
        setEditedContent(targetContent)
        setModalOpen(true)
    }

    const handleRemove = async (targetContent) => {
        const ok = confirm(`¿Estas seguro de eliminar el contenido ${targetContent.title}?`)
        if (!ok) return

        console.log('handleRemove')
        await API.delete(unitId, targetContent.id)
        console.log('removed')
        setContents(contents.filter((u) => u.id !== targetContent.id))
    }

    return (
        <div>
            <div>Contenidos</div>
            <ContentsList
                contents={contents}
                onEdit={handleEdit}
                onRemove={handleRemove}
            />
            <button onClick={() => setModalOpen(true)}> + Agregar nuevo contenido</button>
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
                        <button onClick={() => setModalOpen(false)}> X </button>
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