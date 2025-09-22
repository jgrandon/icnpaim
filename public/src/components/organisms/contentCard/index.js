import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Box, Chip } from '@material-ui/core';
import { PlayArrow, CheckCircle } from '@material-ui/icons';
import { Link } from 'react-router-dom'
import { ProgressIndicator } from './progressIndicator'

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
		nextCard = { completed: false },
		onClick = () => {},
		isCompleted = false,
        isFirst = false,
        isLast = false,
		index = 0
	} = props
	const cardColor = card.color || getDefaultColor(card.tipoActividad)
	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '6fr 1fr 6fr',
				gridTemplateRows: '1fr'
			}}
		>
			<div style={{
				gridColumn: index%2==0 ? 3 : 1 
			}}/>
			<ProgressIndicator 
				isActive={isCompleted}
				isFirst={isFirst}
				isLast={isLast}
				index={index}
				isNextActive={nextCard?.completed}
			/>
			<Link
				to={{ pathname: card.url }}
				onClick={onClick}
				target="_blank"
				style={{
					gridColumn: index%2==0 ? 1 : 3,
					border: `2px solid ${cardColor}`,
					borderRadius: 5,
					padding: 5,
					marginBottom: 8,
					gridRowStart: 1,
					display: 'grid'
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
				<Typography
					variant="body2"
					style={{
						flexGrow: 1,
						fontSize: 12
					}}
				>
				{card.title}
				</Typography>
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
			</Link>
		</div>
	)
}