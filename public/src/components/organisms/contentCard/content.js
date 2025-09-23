import React from 'react';
import Typography from '@material-ui/core/Typography';

export const CardContent = (props) => {
    const { 
        card = {},
        color = ''
    } = props
    
    return <>
        <Typography
            style={{
                flexGrow: 1,
                fontSize: 12,
                fontSize: '1rem',
                lineHeight: '1.75rem',
            }}
        >
        {card.title}
        </Typography>

        <Typography
            style={{
                fontSize: 11,
                color,
                fontSize: '0.875rem',
                lineHeight: '1.25rem',
            }}
        >
        {card.description}
        </Typography>
    </>
}