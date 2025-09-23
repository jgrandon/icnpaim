import React from 'react'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'
import { ProgressIndicator } from './progressIndicator'
import { CardContent } from './content'
import { getDefaultColor } from './colors'
import { CardHeader } from './header'
import { _OK_GREEN, _INACTIVE_GRAY } from './colors'

export const ContentCard = (props) => {
	const { 
		card = {},
		nextCard = { completed: false },
		onClick = () => {},
        isFirst = false,
        isLast = false,
		index = 0
	} = props
	const cardColor = card.color || getDefaultColor(card.tipoActividad)
	const cardBorderColor = card.completed ? _OK_GREEN : _INACTIVE_GRAY

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '6fr 1fr 6fr',
				gridTemplateRows: '1fr'
			}}
		>
			{/* ghost div only for correct display */}
			<div style={{
				gridColumn: index%2==0 ? 3 : 1
			}}/>

			<ProgressIndicator
				isActive={card.completed}
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
					height: '12rem',
					width: '18rem',
					padding: '1.5rem',
					gridColumn: index%2==0 ? 1 : 3,
					border: `2px solid ${cardBorderColor}`,
					borderRadius: 5,
					padding: 5,
					marginBottom: 8,
					gridRowStart: 1,
					display: 'grid',
					color: 'white',
    				textDecoration: 'none'
				}}
			>
				<CardHeader card={card} color={cardColor} />
				<CardContent card={card} color={cardColor} />
				<Typography
					variant="body2"
					style={{
						fontSize: 12,
						color: 'gray'
					}}
				>
					{card.status == 'bloqueado' 
						? 'Bloqueado X'
						: (card.completed ? 'Revisar >' : 'Comenzar >')}
				</Typography>
			</Link>
		</div>
	)
}