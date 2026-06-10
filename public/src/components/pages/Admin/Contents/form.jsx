import React, { useState } from 'react'
import API from '../../../../services/contents'
import * as styles from './form.module.css'


const _EMPTY_CONTENT = { title: '', type: '', url: '' }

export default function ContentsForm ({ unitId }) {
    const [ formData, setFormData ] = useState(_EMPTY_CONTENT)
    const [ editingId, setEditingId ] = useState(null)
    //const [ loading, setLoading ] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const content = await API.updateContent({...formData, unitId})
        return content
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const cancelEdit = () => {
        setEditingId(null)
        setFormData(_EMPTY_CONTENT)
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={styles.form}
        >
            <div className={styles.inputWrapper}>
                <label className={styles.label}>Título *</label>
                <input
                    type='text'
                    name='title'
                    className={styles.input}
                    value={formData.name}
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
                    background: editingId ? '#e67e22' : '#2ecc71'
                }}>
                {editingId ? 'Actualizar Unidad' : 'Agregar Unidad'}
            </button>

            {editingId && (
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

