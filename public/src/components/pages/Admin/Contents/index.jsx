import React, { useState } from 'react'
import Modal from '@material-ui/core/Modal'
import ContentForm from './form'
import * as styles from './contents.module.css'
export default function ContentsAdmin () {
    const [ isModalOpen, setModalOpen ] = useState()

    return (
        <div>
            <button onClick={() => setModalOpen(true)}>Abrir Modal</button>
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
                    <ContentForm/>
                </div>
            </Modal>
        </div>
    )
}