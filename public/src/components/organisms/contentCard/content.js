import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Box, Chip } from '@material-ui/core';
import { PlayArrow, CheckCircle } from '@material-ui/icons';
import { Link } from 'react-router-dom'
import { ProgressIndicator } from './progressIndicator'
import { Content } from './content'
import { getDefaultColor } from './colors'

export const Content = (props) => {
    const { 
        card = {}
    } = props
    const cardColor = card.color || getDefaultColor(card.tipoActividad)
    
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
                color: cardColor
            }}
        >
        {card.content}
        </Typography>
    </>
}