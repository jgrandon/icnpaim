import React, { useState, useEffect } from 'react';
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
} from '@material-ui/core';
import API from '../../../services/units'
import { v4 as uuidv4 } from 'uuid';
import StudentProgressTable from './table'
import Loading from '../../molecules/loading'

export default function ProgressReport() {
    const [report, setReport] = useState({
        units:[],
        students: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {

            const data = await API.getResults()
            console.log('loadData => data', data)
            setReport(data)
        } catch (err) {
            console.error('Fail to load results', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Paper elevation={3}>
            {
                loading
                ? <Loading text='Cargando Reporte...'/> 
                : <StudentProgressTable
                    units={report.units}
                    students={report.students}
                />
            }
        </Paper>
    );
}