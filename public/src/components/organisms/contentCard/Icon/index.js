import {
    PlayArrow,
    Headset,
    MenuBook,
    Description,
    School
} from '@material-ui/icons';

export function Icon (props) {
    const styles = {
        color,
        fontSize: 16,
        marginRight: 8
    }
    const { search , color } = props

    if (search.includes('podcast'))
        return <Headset style={styles}/>
    else if (search.includes('actividad'))
        return <MenuBook style={styles}/>
    else if (search.includes('examen'))
        return <School style={styles}/>
    else if (search.includes('control'))
        return <Description style={styles}/>
    else
        return <PlayArrow style={styles} />
}
