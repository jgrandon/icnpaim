import React from 'react'
import Typography from '@material-ui/core/Typography';
import {
	RadioButtonChecked as Checked,
    RadioButtonUnchecked as Unchecked
} from '@material-ui/icons'
import { Icon } from './Icon'
import { _OK_GREEN, _INACTIVE_GRAY } from './colors'

export function CardHeader(props) {
    const { card, color } = props
	const circleStyles = {
		width: 20,
		height: 20,
		borderRadius: 10,
		color: card.completed ? _OK_GREEN : _INACTIVE_GRAY
	}

    return <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr'
            }}
        >
        <div style={{
            backgroundColor: color,
            display: 'grid',
            padding: '5px',
            gridTemplateColumns: '1fr 2fr',
            borderRadius: '10px',
            alignItems: 'center',
            justifyItems: 'center',
            justifyContent: 'center'
        }}>
            <Icon 
                search={card.tipoActividad}
                color={'white'}
            />
            <Typography
                variant="body2"
                style={{
                    flexGrow: 1,
                    fontSize: 12,
                    color: 'white'
                }}
            >
                {card.tipoActividad || 'actividad'}
            </Typography>
        </div>
        {
            card.completed
            ? <Checked style={circleStyles}/>
            : <Unchecked style={circleStyles}/>
        }
    </div>
}

