import React from 'react'
import{ Modal as MuiModal } from '@material-ui/core'
import * as styles from './modal.module.css'
import CloseIcon from '@material-ui/icons/Close'
import Tooltip from '@material-ui/core/Tooltip'

export default function Modal (props) {
    const {
        open = true,
        onClose = () => {},
        title = 'Default Modal Title',
        buttons = null
    } = props
    return (
        <MuiModal
            open={open}
            className={styles.modal}
            onClose={onClose}
            aria-labelledby='modal-title'
            aria-describedby='modal-description'
        >
            <div className={styles.content}>
                <div className={styles.header}>    
                    <div className={styles.title}>
                        <stong>{title}</stong>
                    </div>
                    <Tooltip title='Cerrar'>
                        <CloseIcon className={styles.closeButton} />
                    </Tooltip>
                </div>

                {props.children}

                {
                    buttons && (
                        <div className={styles.buttons}>
                            {buttons}
                        </div>
                    )
                }
            </div>

        </MuiModal>
    )
}
