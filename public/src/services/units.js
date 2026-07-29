const unitServices = {
    updateUnit: async (data) => {
        try {
            const response = await fetch('/api/v2/units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!response.ok) {
                throw new Error(`Failed to update unit: ${response.status}`)
            }
            const { units } = await response.json()
            return units
        } catch (error) {
            console.error('Error updating unit:', error)
            throw error
        }
    },
    getAll: async () => {
        try {
            const response = await fetch('/api/v2/units')
            if (response.status == 401) window.location.href = '/not-allowed'
            if (!response.ok) {
                throw new Error(`Failed to get all units: ${response.status}`)
            }
            const data = await response.json()
            return data
        } catch (error) {
            console.error('Error getting all units:', error)
            throw error
        }
    },
    delete: async (unit) => {
        try {
            const response = await fetch('/api/v2/units', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({unit})
            })
            if (!response.ok) {
                throw new Error(`Failed to detele unit: ${response.status}`)
            }
            const {units} = await response.json()
            return units
        } catch (error) {
            console.error('Error deleting unit:', error)
            throw error
        }
    },
    updateUnitsPositions: async (units) => {
        console.log('updateUnitsPositions', units)
        try {
            const response = await fetch('/api/v2/units/positions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({units})
            })
            if (!response.ok) {
                throw new Error(`Failed to detele unit: ${response.status}`)
            }
            const {units} = await response.json()
            return units
        } catch (error) {
            console.error('Error deleting unit:', error)
            throw error
        }
    }
}

export default unitServices