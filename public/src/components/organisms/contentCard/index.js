import React from 'react'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'
import { ProgressIndicator } from './progressIndicator'
import { CardContent } from './content'
import { getDefaultColor } from './colors'
import { CardHeader } from './header'
import { _OK_GREEN, _INACTIVE_GRAY } from './colors'
import { forwardRef } from 'react';

const getCurrentCard = (unit) => {
	const iCards = unit.studentLearningRoute.length
	let currentFounded = false
	let currentIndex = 0
	for (let i = 0; i < iCards; i++) {
		if (unit.studentLearningRoute[i].completed && !currentFounded) {
			currentIndex = i
		} else {
			currentFounded = true
		}
	}
	return unit.studentLearningRoute[currentIndex+1]
}

const ContentCard = forwardRef(function ContentCard(props, ref) {
	const { 
		card = {},
		onClick = () => {},
		unit
	} = props
	const { index, completed } = card
	const nextCard = unit.studentLearningRoute[index + 1]
	const prevCard = unit.studentLearningRoute[index - 1]
	const isCurrentCard = getCurrentCard(unit)?.id == card.id
	const { freeProgress: isFreeProgressEnabled } = unit
	const isLocked = !isFreeProgressEnabled && !completed && !isCurrentCard
	const color = unit.color || getDefaultColor(card.tipoActividad)
	const cardColor = completed
		? _OK_GREEN 
		: ( isFreeProgressEnabled || isCurrentCard ? color : _INACTIVE_GRAY )

	return (
		<div
			ref={ref}
			data-id={card.id}
			style={{
				display: 'grid',
				gridTemplateColumns: '6fr 1fr 6fr',
				gridTemplateRows: '1fr',
				alignItems: 'center'
			}}
		>
			{/* ghost div only for correct display */}
			<div style={{
				gridColumn: index%2==0 ? 3 : 1
			}}/>

			<ProgressIndicator
				isActive={completed}
				index={index}
				next={nextCard}
				prev={prevCard}
				color={color}
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
					border: `2px solid ${cardColor}`,
					borderRadius: '1rem',
					gridRowStart: 1,
					display: 'grid',
					color: 'black',
					textDecoration: 'none',
					boxShadow: 'rgba(0, 0, 0, 0.15) 1px 2px 6px 3px',
					'&:hover': {
						trasnform : 'translate(2px, 2px) rotate(-2deg) skewX(0deg) skewY(0deg) scaleY(1.05) scaleX(1.05)'
					}
				}}
			>
				<CardHeader card={card} color={cardColor} />
				<CardContent card={card} color={color} />
				<Typography
					variant="body2"
					style={{
						fontSize: 12,
						color: 'gray',
						display: 'flex',
						justifyContent: 'flex-end',
						alignItems: 'flex-end'
					}}
				>
					{isLocked
						? 'Bloqueado X'
						: (completed ? 'Revisar >' : 'Comenzar >')}
				</Typography>
			</Link>
		</div>
	)
})

export default ContentCard