import { Box, Chip } from '@material-ui/core';
import { PlayArrow, CheckCircle } from '@material-ui/icons';
import { v4 as uuidv4 } from 'uuid';

export const ContentCard = (props) => {
	const { 
		card = {},
		onClick = () => {},
		isCompleted = false,
		activityColor = 'gray',
		onCardCompleted = () => {}
	} = props
	return (
		<Box 
			key={uuidv4()}
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
				<CheckCircle style={{ color: '#4caf50', fontSize: 16, marginRight: 8 }} />
			) : (
				<PlayArrow style={{
					color: activityColor,
					fontSize: 16,
					marginRight: 8
				}} />
			)}
			<Link
				to={card.url}
				onClick={onClick}
				target="_blank"
			>
				<Typography variant="body2" style={{ flexGrow: 1, fontSize: 12 }}>
				{card.title}
				</Typography>
			</Link>
			<Chip
				label={card.tipoActividad || 'actividad'} 
				size="small"
				style={{ 
				backgroundColor: card.color || activityColor,
				color: 'white',
				fontSize: 9,
				height: 20
				}}
			/>
		</Box>
	)
}