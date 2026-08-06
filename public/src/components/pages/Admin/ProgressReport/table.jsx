import React, { useState, useEffect } from 'react'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  LinearProgress,
  Tooltip,
  Box,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { v4 as uuidv4 } from 'uuid'

// Custom colored LinearProgress using MUI v4 withStyles
const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 10,
    borderRadius: 5,
  },
  colorPrimary: {
    backgroundColor:
      theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: (props) =>
      props.value >= 100 ? '#4caf50' : theme.palette.primary.main,
  },
}))(LinearProgress);

const useStyles = makeStyles((theme) => ({
    container: {
        maxHeight: 600,
        overflowY: 'auto'
    },
    table: {
        minWidth: 650,
        tableLayout: 'fixed'
    },
    headerCell: {
        backgroundColor: '#ec622b',//theme.palette.primary.main,
        overflowWrap: 'break-word',
        color: theme.palette.common.white,
        fontWeight: 'bold',
        borderLeft: '1px white solid',
        borderRight: '1px white solid'
    },
    studentCell: {
        fontWeight: 600,
        position: 'sticky',
        left: 0,
        backgroundColor: theme.palette.background.paper,
        zIndex: 1,
    },
    progressCell: {
        borderLeft: '1px solid #c4c4c4',
        borderRight: '1px solid #c4c4c4'
    },
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    percentText: {
        minWidth: 35,
        fontSize: '0.85rem',
    },
    noStudents: {
        fontSize: '0.85rem',
        padding: '20px'
    }
}));

export default function StudentProgressTable(props) {
    const classes = useStyles();
    //const [students, setStudents] = useState(props.students)
    //const [units, setUnits] = useState(props.units)

    return (
        <Paper elevation={3}>
            <TableContainer className={classes.container}>
                <Table className={classes.table} stickyHeader aria-label="student progress table">
                    <TableHead>
                        <TableRow key={uuidv4()}>
                            <TableCell className={classes.headerCell}>Estudiante</TableCell>
                            {props.units.map((u) => (
                                <TableCell key={uuidv4()} align="center" className={classes.headerCell}>
                                {u.unit.name}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.students.map((row) => (
                        <TableRow key={uuidv4()} hover>
                            <TableCell component="th" scope="row" className={classes.studentCell}>
                            {row.student.name}
                            </TableCell>

                            {row.progress.map((p) => {
                            const percentage = p.percentage ?? 0;
                            const tooltipText = p.total == 0
                                ? 'Sin evaluacion' 
                                : `${p.value} de ${p.total} Actividades Completadas`
                            return (
                                <TableCell key={uuidv4()} align="center" className={classes.progressCell}>
                                    <Tooltip title={tooltipText} arrow placement="top">
                                            { p.total == 0
                                            ? <div><CloseIcon/></div>
                                            : <Box className={classes.progressContainer}>
                                                <Box width="100%">
                                                    <BorderLinearProgress
                                                    variant="determinate"
                                                    value={percentage}
                                                    />
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    color="textSecondary"
                                                    className={classes.percentText}
                                                >
                                                    {`${percentage}%`}
                                                </Typography>
                                            </Box> }
                                    </Tooltip>
                                </TableCell>
                            );
                            })}
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            { props.students.length == 0
                ? <Typography
                    variant="body2"
                    color="textSecondary"
                    className={classes.noStudents}
                > Sin estudiantes </Typography>
                : null}
        </Paper>
    );
}