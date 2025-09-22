import {
    PlayArrow,
    HeadPhones,
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
        return <HeadPhones style={styles}/>
    else if (search.includes('actividad'))
        return <MenuBook style={styles}/>
    else if (search.includes('examen'))
        return <School style={styles}/>
    else if (search.includes('control'))
        return <Description style={styles}/>
    else
        return <PlayArrow style={styles} />
}
