import React, { useState } from 'react'
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        const updatedContent = await API.updateContent({...formData, unitId})
        const action = formData.id ? 'updated' : 'added'
        updateCallback(action, updatedContent)
        return updatedContent
    }

    const handleInputChange = (e) => {
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
            onSubmit={handleSubmit}
            className={styles.form}
        >
            <input
                name='id'
                type='hidden'
                value={content.id ?? ''}
            />

            <div className={styles.inputWrapper}>
                <label className={styles.label}>Título *</label>
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
                <label className={styles.label}> Tipo * </label>
                <input
                    type='text'
                    name='type'
                    className={styles.input}
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder='Tipo'
                    required
                />
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

            <button
                type='submit'
                className={styles.submitButton}
                style={{
                    background: content.id ? '#e67e22' : '#2ecc71'
                }}>
                {content.id ? 'Actualizar Unidad' : 'Agregar Unidad'}
            </button>

            {content.id && (
                <button
                    type='button'
                    onClick={cancelEdit}
                    style={{ padding: '8px 12px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Cancel
                </button>
            )}
        </form>
    )
}

