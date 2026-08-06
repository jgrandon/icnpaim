import React, { useState, useEffect } from 'react';
import {
  Paper,
  MenuItem,
  Select,
  InputLabel
} from '@material-ui/core';
import API from '../../../../services/units'
import { v4 as uuidv4 } from 'uuid';
import StudentProgressTable from './table'
import Loading from '../../../molecules/loading'
import * as styles from './ProgressReport.module.css'

export default function ProgressReport() {
    const [report, setReport] = useState({
        units:[],
        students: [],
        groups: []
    })
    const [selectedGroup, setSelectedGroup] = useState('all')
    const [filteredStudents, setFilteredStudents] = useState([])

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await API.getResults()
            setReport(data)
            setFilteredStudents(data.students)
        } catch (err) {
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (e) => {
        const { value } = e.target
        let students
        if ( value == 'all') {
            students = report.students
        } else if (value == 'none') {
            students = getStudentsWithoutGroup()
        } else {
            students = report.students.filter(s => s.group?.id == value) ?? []
        }
        setFilteredStudents(students)
        setSelectedGroup(value)

    }

    const getStudentsWithoutGroup = () => {
        return report.students.filter(s => !s.group) ?? []
    }

    return (
        <Paper
            elevation={3}
            style={{
                minWidth: '650px',
            }}
        >
            {
                loading
                ? <Loading text='Cargando Reporte...'/> 
                : <div className={styles.wrapper}>
                    <div>
                        <InputLabel id='groups'>Secciones:</InputLabel>
                        <Select
                            name='type'
                            value={selectedGroup}
                            onChange={handleFilterChange}
                            defaultValue='clase'
                            style={{
                                padding: '6px',
                                height: '30px',
                                width: '200px',
                                fontfamily: 'system-ui'
                            }}
                        >
                            <MenuItem value={'all'} key={uuidv4()}>Todas</MenuItem>
                            <MenuItem value={'none'} key={uuidv4()}>Sin Sección - ({getStudentsWithoutGroup().length} alumnos)</MenuItem>
                            { report.groups.map(g => (
                                <MenuItem value={g.id} key={uuidv4()}>{g.name} - ({g.students.length} alumnos)</MenuItem>
                            )) }
                        </Select>
                    </div>
                    <StudentProgressTable
                    units={report.units}
                    students={filteredStudents}
                    />
                </div>
            }
        </Paper>
    );
}