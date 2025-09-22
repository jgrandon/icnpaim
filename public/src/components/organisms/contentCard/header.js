import Typography from '@material-ui/core/Typography';
import {
	RadioButtonChecked as Checked,
    RadioButtonUnchecked as Unchecked
} from '@material-ui/icons'
import { Icon } from './Icon'
import { _OK_GREEN } from './colors'

export function CardHeader(props) {
    const { card, color } = props
	const circleStyles = {
		width: 20,
		height: 20,
		borderRadius: 10,
		border: `2px solid ${_OK_GREEN}`
	}

    return <div>
        <div style={{
            backgroundColor: color
        }}>
            <Icon 
                search={card.tipoActividad}
                color={'white'}
            />
            <Typography
                variant="body2"
                color={'white'}
                style={{
                    flexGrow: 1,
                    fontSize: 12
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

