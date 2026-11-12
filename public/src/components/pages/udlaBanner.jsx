import React from 'react'
import {
    Typography,
    Card,
    CardContent,
    Box
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
    udlaCard: {
        background: 'black',
        color: 'white',
        padding: '10px'
    },
    text: {
        fontSize: '1.5rem !important'
    },
    udlaLogo: {
        width: '150px'
    }
}))

export default function UdlaBanner() {
    const classes = useStyles()
    return (
        <Card className={classes.udlaCard} elevation={4}>
            <CardContent>
                <Box display='flex' alignItems='center' justifyContent='space-between'>
                    <Box>
                        <Typography 
                            className={classes.text}
                            variant='h4' component='h4'
                        >
                        Rutas Interactivas Aprendizaje (RIA)
                        </Typography>
                    </Box>
                    <Box display='flex' alignItems='center' style={{ gap: 16 }}>
                        <img 
                            className={classes.udlaLogo}
                            src='https://udla.cl/wp-content/uploads/2025/09/logo-udla-blanco.png' />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}