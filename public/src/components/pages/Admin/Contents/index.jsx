import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal'
import ContentForm from './form'
import * as styles from './contents.module.css'
import ContentsList from './list'
import API from '../../../../services/contents'

export default function ContentsAdmin ({ unitId = null }) {
    const [ isModalOpen, setModalOpen ] = useState(false)
    const [ contents, setContents ]= useState([])

    useEffect( () => {
        if (unitId) loadContents()
    }, [ unitId ])
    
    const loadContents = async () => {
        const data = await API.getAll(unitId)
        setContents(data)
    }

    return (
        <div>
            <div>Contenidos</div>
            <ContentsList contents={contents} />
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
                        <button onClose={() => setModalOpen(false)}> X </button>
                    </div>
                    <ContentForm unitId={unitId}/>
                </div>
            </Modal>
        </div>
    )
}