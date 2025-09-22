import React from 'react';
import Typography from '@material-ui/core/Typography';

export const CardContent = (props) => {
    const { 
        card = {},
        color = ''
    } = props
    
    return <>
        <Typography
            variant="body2"
            style={{
                flexGrow: 1,
                fontSize: 12
            }}
        >
        {card.title}
        </Typography>

        <Typography
            variant="body2"
            style={{
                fontSize: 11,
                color
            }}
        >
        {card.content}
        </Typography>
    </>
}