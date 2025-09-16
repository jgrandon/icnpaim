import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Box, Chip } from '@material-ui/core';
import { PlayArrow, CheckCircle } from '@material-ui/icons';
import { Link } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid';
import styles from './contentCard.css'; // Import the CSS file

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
		isCompleted = false
	} = props
	const cardColor = card.color || getDefaultColor(card.tipoActividad)
	return (
		<div
			className={styles.main}
			style={{
				backgroundColor: isCompleted ? '#e8f5e8' : '#f5f5f5',
				border: `2px solid ${isCompleted ? '#4caf50' : 'transparent'}`
			}}
		>
			<div
				key={uuidv4()}
				className={styles.indicator}
				style={{ 
					backgroundColor: isCompleted ? '#4caf50' : '#aaaaaaff',
					border: `2px solid ${isCompleted ? '#308a33ff' : '#5e5e5eff'}`
				}}
			>
				<div className={styles.indicatorNode}/>
				<div className={styles.indicatorPipe}/>

			</div>
			<Link
				className={styles.link}
				to={{ pathname: card.url }}
				onClick={onClick}
				target="_blank"
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