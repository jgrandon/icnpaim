const _DEFAULT_COLORS = {
	video: '#e53e3e',
	lectura: '#3182ce',
	quiz: '#d69e2e',
	recurso: '#38a169',
	externo: '#805ad5'
}

export const getDefaultColor = (type) => {
	return _DEFAULT_COLORS[type] || '#718096'
}

export const _OK_GREEN = '#4caf50'
export const _INACTIVE_GRAY = '#aaaaaaff'