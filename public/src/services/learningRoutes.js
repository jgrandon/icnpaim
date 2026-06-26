const learningRouteServices = {
    updateContents: async (data) => {
        const { unitId, lrLevel } = { data }
        try {
            const response = await fetch(
                `/api/v2/units/${unitId}/lr/${lrLevel}/contents`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
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
    }
}

export default learningRouteServices