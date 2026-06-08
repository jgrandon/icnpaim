import React, { useState, useEffect } from 'react'

// --- MOCK API HANDLERS (Replace these with your actual backend fetch/axios calls) ---
const mockAPI = {
    getAll: async () => [
        { id: 1, name: 'Main Unit', color: '#ff0000', position: 1 },
        { id: 2, name: 'Backup Unit', color: '#0000ff', position: 2 },
    ],
    create: async (unit) => ({ ...unit, id: Date.now() }), // temporary ID generation
    update: async (id, unit) => ({ ...unit, id }),
    delete: async (id) => true,
};

export default function UnitCRUD() {
    const [ units, setUnits ] = useState([])
    const [ formData, setFormData ] = useState({ name: '', color: '#000000', position: '' })
    const [ editingId, setEditingId ] = useState(null)
    const [ loading, setLoading ] = useState(false)
    // Load units on component mount
    useEffect(() => {
        loadUnits()
    }, [])

    const loadUnits = async () => {
        setLoading(true)
        try {
            const data = await mockAPI.getAll() // Replace with: fetch('/api/units').then(res => res.json())
            setUnits(data)
        } catch (err) {
            console.error('Failed to load units', err)
        } finally {
            setLoading(false)
        }
    }

    // Handle Form Inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'position' ? parseInt(value, 10) || '' : value,
        }))
    }

    // Handle Submit (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || formData.position === '') return alert('Name and Position are required')

        try {
            if (editingId) {
            // Update Action
                const updatedUnit = await mockAPI.update(editingId, formData)
                setUnits(units.map((u) => (u.id === editingId ? updatedUnit : u)))
                setEditingId(null)
            } else {
            // Create Action
                const newUnit = await mockAPI.create(formData)
                setUnits([ ...units, newUnit ])
            }
            // Reset form
            setFormData({ name: '', color: '#000000', position: '' })
        } catch (err) {
            console.error('Save failed', err)
        }
    }

    // Set form up for Editing
    const startEdit = (unit) => {
        setEditingId(unit.id)
        setFormData({ name: unit.name, color: unit.color || '#000000', position: unit.position })
    }

    // Cancel Editing
    const cancelEdit = () => {
        setEditingId(null)
        setFormData({ name: '', color: '#000000', position: '' })
    }

    // Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this unit?')) return
        try {
            await mockAPI.delete(id)
            setUnits(units.filter((u) => u.id !== id))
        } catch (err) {
            console.error('Delete failed', err)
        }
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Unit Management Suite (CRUD)</h2>

            {/* --- FORM SECTION --- */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Name *</label>
                    <input type='text' name='name' value={formData.name} onChange={handleInputChange} placeholder='Unit Name' required style={{ padding: '6px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Color</label>
                    <input type='color' name='color' value={formData.color} onChange={handleInputChange} style={{ padding: '2px', width: '60px', height: '32px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Position *</label>
                    <input type='number' name='position' value={formData.position} onChange={handleInputChange} placeholder='0' required style={{ padding: '6px', width: '80px' }} />
                </div>

                <button type='submit' style={{ padding: '8px 16px', background: editingId ? '#e67e22' : '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {editingId ? 'Update Unit' : 'Add Unit'}
                </button>

                {editingId && (
                    <button type='button' onClick={cancelEdit} style={{ padding: '8px 12px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancel
                    </button>
                )}
            </form>

            {/* --- DATA TABLE SECTION --- */}
            {loading ? (
                <p>Loading units...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ddd', background: '#eaedd1' }}>
                            <th style={{ padding: '10px' }}>ID</th>
                            <th style={{ padding: '10px' }}>Name</th>
                            <th style={{ padding: '10px' }}>Color Preview</th>
                            <th style={{ padding: '10px' }}>Position</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {units.length === 0 ? (
                            <tr>
                                <td colSpan='5' style={{ padding: '20px', textAlign: 'center', color: '#777' }}>No units found. Add one above!</td>
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
                                        Edit
                                        </button>
                                        <button onClick={() => handleDelete(unit.id)} style={{ padding: '4px 8px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                                        Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    )
}