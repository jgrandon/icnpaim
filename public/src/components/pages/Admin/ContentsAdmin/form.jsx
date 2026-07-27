import React, { useState } from 'react'
import CloseIcon from '@material-ui/icons/Close'
import SaveIcon from '@material-ui/icons/Save'
import {
    Button,
    MenuItem,
    Select
} from '@material-ui/core'
import API from '../../../../services/contents'
import * as styles from '../form.module.css'

const _EMPTY_CONTENT = { title: '', type: '', url: '' }

export default function ContentsForm ({
    unitId,
    content = {},
    updateCallback = () => {}
}) {
    const [ formData, setFormData ] = useState(
        content.id ? content : _EMPTY_CONTENT
    )
    const [ touched, setTouched ] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const updatedContent = await API.updateContent({...formData, unitId})
        const action = formData.id ? 'updated' : 'added'
        updateCallback(action, updatedContent)
        return updatedContent
    }

    const handleInputChange = (e) => {
        setTouched(true)
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const cancelEdit = () => {
        updateCallback('cenceled', {})
    }

    return (
        <form
            className={styles.form}
        >
            <input
                name='id'
                type='hidden'
                value={content.id ?? ''}
            />

            <div className={styles.inputWrapper}>
                <label className={styles.label}> Título </label>
                <input
                    type='text'
                    name='title'
                    className={styles.input}
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder='Título'
                    required
                />
            </div>

            <div className={styles.inputWrapper}>
                <label className={styles.label}> Tipo </label>
                
                <Select
                    name='type'
                    value={formData.type}
                    onChange={handleInputChange}
                    defaultValue='clase'
                    style={{
                        padding: '6px',
                        height: '30px',
                        width: '200px',
                        fontfamily: 'system-ui'
                    }}
                >
                    <MenuItem value={'clase'}>Clase</MenuItem>
                    <MenuItem value={'podcast'}>Podcast</MenuItem>
                    <MenuItem value={'video'}>Video</MenuItem>
                    <MenuItem value={'control'}>Control</MenuItem>
                    <MenuItem value={'scorm'}>Scorm</MenuItem>
                </Select>
                {/*}
                <input
                    type='text'
                    name='type'
                    className={styles.input}
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder='Tipo'
                    required
                />
                */}
            </div>

            <div className={styles.inputWrapper}>
                <label className={styles.label}>URL</label>
                <input
                    type='text'
                    name='url'
                    className={styles.input}
                    value={formData.url}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <hr />

            <div className={styles.buttons}>
                <Button
                    onClick={cancelEdit}
                    variant='outlined'
                    startIcon={<CloseIcon/>}
                >
                    {touched ? 'Cancelar' : 'Cerrar'}
                </Button>
                {touched
                    ? (<Button
                        onClick={handleSubmit}
                        startIcon={<SaveIcon/>}
                        variant='contained'
                        color='primary'
                        size='small'>Guardar</Button>)
                    : null}
            </div>
        </form>
    )
}

