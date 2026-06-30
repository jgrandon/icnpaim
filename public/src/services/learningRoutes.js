const learningRouteServices = {
    updateContents: async (data) => {
        const { unitId, lrId } = data
        try {
            const response = await fetch(
                `/api/v2/units/${unitId}/lr/${lrId}/contents`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data.contents)
                }
            )
            if (!response.ok) {
                throw new Error(`Failed to update content: ${response.status}`)
            }
            const { content } = await response.json()
            return content
        } catch (error) {
            console.error('Error updating content:', error)
            throw error
        }
    },


    getLearningRoutes: async (unitId) => {
        try {
            const response = await fetch(`/api/v2/units/${unitId}/lr`)
            if (!response.ok) {
                throw new Error(`Failed to update content: ${response.status}`)
            }
            const { learningRoutes } = await response.json()
            return learningRoutes
        } catch (error) {
            console.error('Error updating content:', error)
            throw error
        }
    },

    updateSchema: async (unitId, data) => {
        try {
            const response = await fetch(
                `/api/v2/units/${unitId}/lr/schema`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }
            )
            if (!response.ok) {
                throw new Error(`Failed to update LR schema: ${response.status}`)
            }
            const { learningRoutes } = await response.json()
            return learningRoutes
        } catch (error) {
            console.error('Error updating LR schema:', error)
            throw error
        }
    }
}

export default learningRouteServices