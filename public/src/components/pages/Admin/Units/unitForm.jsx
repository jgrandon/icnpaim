import React, { useState, useEffect } from 'react'
import API from '../../../../services/units'

export default function UnitForm ({
    unit, 
    updateCallback = () => {}
}) {
    //const [ units, setUnits ] = useState([])
    const [ modified, setModified ] = useState(false)
    const [ formData, setFormData ] = useState({ name: unit, color: '#000000', position: '' })
    //const [ selectedUnitId, setSelectedUnitId ] = useState(null)

    useEffect(()=> {
        resetFormData()
    }, [])

    const resetFormData = () => {
        setFormData({
            id: unit.id ?? null,
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
            if (unit) {
            // Update Action
                const updatedUnit = await API.updateUnit({ ...formData })
                //setSelectedUnitId(null)
                updateCallback('updated',updatedUnit)
            } else {
            // Create Action
                const newUnit = await API.updateUnit(formData)
                updateCallback('added', newUnit)
            }
            alert('Datos Guardados')
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
            onSubmit={handleSubmit}
            style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-end',
                marginBottom: '30px',
                padding: '15px',
                background: '#f5f5f5',
                borderRadius: '6px'
            }}
        >

            <input
                name='id'
                type='hidden'
                value={formData.id}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Nombre *</label>
                <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder='Nombre Unidad'
                    required
                    style={{ padding: '6px' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label
                    style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}
                >Color</label>
                <input
                    type='color'
                    name='color'
                    value={formData.color}
                    onChange={handleInputChange}
                    style={{ padding: '2px', width: '60px', height: '32px' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Posicion *</label>
                <input
                    type='number'
                    name='position'
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder='0'
                    required
                    style={{ padding: '6px', width: '80px' }}    
                />
            </div>

            <button
                type='submit'
                style={{ padding: '8px 16px', background: unit ? '#e67e22' : '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                {unit ? 'Actualizar' : 'Agregar'}
            </button>

            {modified && (
                <button 
                    type='button'
                    onClick={cancelEdit} style={{ padding: '8px 12px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Cancel
                </button>
            )}

            {unit.id && (
                <button
                    onClick={handleDelete}
                    style={{ padding: '4px 8px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                >
                Eliminar
                </button>
            )}
        </form>
    )
}