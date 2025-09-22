import Typography from '@material-ui/core/Typography';
import {
	RadioButtonChecked as Checked,
    RadioButtonUnchecked as Unchecked
} from '@material-ui/icons'
import { Icon } from './Icon'

export function CardHeader(props) {
    const { card } = props
	const circleStyles = {
		width: 20,
		height: 20,
		borderRadius: 10,
		border: '2px solid rgb(209 213 219 )'
	}

    return <div>
        <div>
            <Icon search={card.tipoActividad}/>
            <Typography
                variant="body2"
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

