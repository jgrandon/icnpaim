import React, { useState, useEffect } from 'react'
import ContentsAdmin from '../Contents'
import { v4 as uuidv4 } from 'uuid'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Unitform from './unitForm'

import API from '../../../../services/units'
import * as styles from './units.module.css'

export default function UnitsAdmin() {
    const [ units, setUnits ] = useState([])
    const [ formData, setFormData ] = useState({ name: '', color: '#000000', position: '' })
    const [ selectedUnitId, setSelectedUnitId ] = useState(null)
    const [ loading, setLoading ] = useState(false)

    useEffect(() => {
        loadUnits()
    }, [])

    const loadUnits = async () => {
        setLoading(true)
        try {
            const data = await API.getAll()
            setUnits(data)
        } catch (err) {
            console.error('Fail to load units', err)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
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
            if (selectedUnitId) {
            // Update Action
                const updatedUnit = await API.updateUnit({...formData, id: selectedUnitId})
                setUnits(units.map((u) => (u.id === selectedUnitId ? updatedUnit : u)))
                setSelectedUnitId(null)
            } else {
            // Create Action
                const newUnit = await API.updateUnit(formData)
                setUnits([ ...units, newUnit ])
            }
            // Reset form
            setFormData({ name: '', color: '#000000', position: '' })
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

    const cancelEdit = () => {
        setSelectedUnitId(null)
        setFormData({ name: '', color: '#000000', position: '' })
    }
    /*
    const handleDelete = async (id) => {
        if (!window.confirm('Estas seguro de eliminar esta Unidad?')) return
        try {
            await API.delete(id)
            setUnits(units.filter((u) => u.id !== id))
        } catch (err) {
            console.error('Delete failed', err)
        }
    }
*/

    const handleAccordionChange = (panel) => (e, isExpanded) => {
        setSelectedUnitId(isExpanded ? panel : false )
    }

    const handleUnitsUpdate = (action, updatedUnit) => {
        console.log('handleUnitsUpdate', {action,updatedUnit})
        if (action == 'added') {
            console.log('added')
            setUnits([ ...units, updatedUnit ])
        } if (action == 'updated') {
            console.log('updated')
            setUnits(units.map((u) => (u.id === selectedUnitId ? updatedUnit : u)))
        } if (action == 'removed') {
            console.log('removed')
            setUnits(units.filter((u) => u.id !== updatedUnit.id))
        }
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Unidades</h2>

            {/* --- FORM SECTION --- */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Nombre *</label>
                    <input type='text' name='name' value={formData.name} onChange={handleInputChange} placeholder='Nombre Unidad' required style={{ padding: '6px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Color</label>
                    <input type='color' name='color' value={formData.color} onChange={handleInputChange} style={{ padding: '2px', width: '60px', height: '32px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Posicion *</label>
                    <input type='number' name='position' value={formData.position} onChange={handleInputChange} placeholder='0' required style={{ padding: '6px', width: '80px' }} />
                </div>

                <button type='submit' style={{ padding: '8px 16px', background: selectedUnitId ? '#e67e22' : '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {selectedUnitId ? 'Actualizar Unidad' : 'Agregar Unidad'}
                </button>

                {selectedUnitId && (
                    <button type='button' onClick={cancelEdit} style={{ padding: '8px 12px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancel
                    </button>
                )}
            </form>



            {loading ? (
                <p>Loading units...</p>
            ) : (<div>
                {
                    units.map((unit) => (
                        <Accordion
                            key={uuidv4()}
                            expanded={selectedUnitId === unit.id}
                            onChange={handleAccordionChange(unit.id)}
                        >
                            <AccordionSummary className={styles.accordion}>
                                <div 
                                    className={styles.colorIndicator}
                                    style={{
                                        backgroundColor: unit.color
                                    }}
                                ></div>
                                {unit.name}
                            </AccordionSummary>
                            <AccordionDetails>
                                <Unitform
                                    unit={unit}
                                    updateCallback={handleUnitsUpdate}
                                />
                                <ContentsAdmin unitId={selectedUnitId}/>
                            </AccordionDetails>
                        </Accordion> 
                    ))
                }
            </div>
            )}
        </div>
    )
}
{/*
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ddd', background: '#eaedd1' }}>
                            <th style={{ padding: '10px' }}>ID</th>
                            <th style={{ padding: '10px' }}>Nombre</th>
                            <th style={{ padding: '10px' }}>Color</th>
                            <th style={{ padding: '10px' }}>Posición</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {units.length === 0 ? (
                            <tr>
                                <td colSpan='5' style={{ padding: '20px', textAlign: 'center', color: '#777' }}>No se encontraron unidades. Agrega una!</td>
                            </tr>
                        ) : (
                            units.map((unit) => (
                                <tr key={unit.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{unit.id}</td>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{unit.name}</td>
                                    <td style={{ padding: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '4px', backgroundColor: unit.color || '#cccccc', border: '1px solid #aaa' }}></span>
                                            <code style={{ fontSize: '12px' }}>{unit.color || 'none'}</code>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px' }}>{unit.position}</td>
                                    <td style={{ padding: '10px', textAlign: 'right' }}>
                                        <button onClick={() => startEdit(unit)} style={{ marginRight: '6px', padding: '4px 8px', background: '#3498db', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                                        Modificar
                                        </button>
                                        <button onClick={() => handleDelete(unit.id)} style={{ padding: '4px 8px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                                        Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
*/}