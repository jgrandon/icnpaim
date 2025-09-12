import React from 'react';
import { Box, Chip } from '@material-ui/core';
import { PlayArrow, CheckCircle } from '@material-ui/icons';


const _DEFAULT_COLORS = {
	video: '#e53e3e',
	lectura: '#3182ce',
	quiz: '#d69e2e',
	recurso: '#38a169',
	externo: '#805ad5'
}

const getDefaultColor = (type) => {
	return _DEFAULT_COLORS[type] || '#718096'
}

export const ContentCard = (props) => {
	const { 
		card = {},
		onClick = () => {},
		isCompleted = false,
		onCardCompleted = () => {}
	} = props
	const cardColor = card.color || getDefaultColor(card.tipoActividad)
	return (
		<Box
			display="flex"
			alignItems="center" 
			style={{ 
				padding: 8,
				marginBottom: 8,
				backgroundColor: isCompleted ? '#e8f5e8' : '#f5f5f5',
				borderRadius: 8,
				border: `2px solid ${isCompleted ? '#4caf50' : 'transparent'}`
			}}
		>
			{isCompleted ? (
				<CheckCircle style={{
					color: '#4caf50',
					fontSize: 16,
					marginRight: 8
				}} />
			) : (
				<PlayArrow style={{
					color: cardColor,
					fontSize: 16,
					marginRight: 8
				}} />
			)}
			<Link
				to={card.url}
				onClick={onClick}
				target="_blank"
			>
				<Typography
					variant="body2"
					style={{
						flexGrow: 1,
						fontSize: 12
					}}
				>
				{card.title}
				</Typography>
			</Link>
			<Chip
				label={card.tipoActividad || 'actividad'} 
				size="small"
				style={{ 
					backgroundColor: cardColor,
					color: 'white',
					fontSize: 9,
					height: 20
				}}
			/>
		</Box>
	)
}