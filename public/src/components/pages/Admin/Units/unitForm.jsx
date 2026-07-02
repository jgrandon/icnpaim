import React, { useState, useEffect } from 'react'
import API from '../../../../services/units'
import * as styles from '../form.module.css'
import SaveIcon from '@material-ui/icons/Save'
import CloseIcon from '@material-ui/icons/Close'
import DeleteIcon from '@material-ui/icons/Delete'
import Button from '@material-ui/core/Button'

export default function UnitForm ({
    unit,
    cancel = false, // has cancel button
    updateCallback = () => {}
}) {
    const [ modified, setModified ] = useState(false)
    const [ formData, setFormData ] = useState({ id: '', name: unit, color: '#000000', position: '' })

    useEffect(()=> {
        resetFormData()
    }, [])

    const resetFormData = () => {
        setFormData({
            id: unit.id ?? '',
            name: unit.name ?? '',
            color: unit.color ?? '#000000',
            position: unit.position ?? ''
        })
    }

    const handleInputChange = (e) => {
        setModified(true)
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'position' ? parseInt(value, 10) || '' : value,
        }))
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || formData.position === '') return alert('Nombre y posición son obligatorios')

        try {
            if (unit.id) {
            // Update Action
                const updatedUnit = await API.updateUnit({ ...formData })
                //setSelectedUnitId(null)
                updateCallback('updated',updatedUnit)
            } else {
            // Create Action
                const newUnit = await API.updateUnit(formData)
                updateCallback('added', newUnit)
            }
            //alert('Datos Guardados')
        } catch (err) {
            console.error('Save failed', err)
        }
    }
    /*
    const startEdit = (unit) => {
        setSelectedUnitId(unit.id)
        setFormData({ name: unit.name, color: unit.color || '#000000', position: unit.position })
    }
        */
    
    const cancelEdit = (e) => {
        e.preventDefault()
        updateCallback('canceled', unit)
        setModified(false)
        resetFormData()
    }
    
    const handleDelete = async (e) => {
        e.preventDefault()

        if (!window.confirm('Estas seguro de eliminar esta Unidad? Se borrarán tambien todos sus Contenidos')) return
        try {
            await API.delete(unit.id)
            console.log('handleDelete', unit)
            updateCallback('removed', unit)
        } catch (err) {
            console.error('Delete failed', err)
        }
    }

    return (
        <form
            style={{
                width: '350px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
            onSubmit={handleSubmit}
        >
            <div className={styles.form}>
                <input
                    name='id'
                    type='hidden'
                    value={formData.id}
                />
                <div className={styles.inputWrapper}>
                    <label
                        className={styles.label}
                    >Nombre</label>
                    <input
                        type='text'
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder='Nombre Unidad'
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.label} > Color </label>
                    <input
                        type='color'
                        name='color'
                        className={styles.color}
                        value={formData.color}
                        onChange={handleInputChange}
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label
                        className={styles.label}
                    >Posicion</label>
                    <input
                        type='number'
                        name='position'
                        value={formData.position}
                        onChange={handleInputChange}
                        placeholder='0'
                        required
                        className={styles.input}
                    />
                </div>

            </div>
            
            <hr />
            <div className={styles.buttons}>


                {cancel && (
                    <Button
                        variant='outlined'
                        color='primary'
                        size='small'
                        startIcon={<CloseIcon />}
                        style={{ height: '30px' }}
                        onClick={cancelEdit} 
                    >
                        {modified ? 'Cancelar' : 'Cerrar'}
                    </Button>
                )}

                {unit.id && (
                    <Button
                        variant='outlined'
                        color='primary'
                        size='small'
                        startIcon={<DeleteIcon />}
                        style={{ height: '30px' }}
                        onClick={handleDelete}
                    > Eliminar
                    </Button>
                )}

                {modified && (
                    <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        size='small'
                        startIcon={<SaveIcon />}
                        style={{ height: '30px' }}
                    >
                        {unit.id ? 'Actualizar' : 'Agregar'}
                    </Button>
                )}
            </div>
        </form>
    )
}