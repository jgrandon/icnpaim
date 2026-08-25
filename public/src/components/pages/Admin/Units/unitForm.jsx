import React, { useState, useEffect } from 'react'
import SaveIcon from '@material-ui/icons/Save'
import CloseIcon from '@material-ui/icons/Close'
import DeleteIcon from '@material-ui/icons/Delete'
import {
    Button,
    TextField,
    Switch,
    Tooltip
} from '@material-ui/core'
import API from '../../../../services/units'
import * as styles from '../form.module.css'


export default function UnitForm ({
    unit,
    cancel = false, // has cancel button
    updateCallback = () => {}
}) {
    const [ modified, setModified ] = useState(false)
    const [ formData, setFormData ] = useState({
        id: '',
        name: '',
        description: '',
        color: '#000000',
        evaluationName: '',
        evaluationId: '',
        published: false,
        freeProgress: false,
        expiresAt: getTodayString()
    })

    useEffect(()=> {
        resetFormData()
    }, [])

    const timeToString = (timestamp) => (new Date(timestamp)).toJSON().slice(0,10)
    const getTodayString = () => (new Date()).toJSON().slice(0,10)
    const stringToTime = (string) => new Date(string).getTime()+(4*60*60*1000)

    const resetFormData = () => {
        setFormData({
            id: unit.id ?? '',
            name: unit.name ?? '',
            description: unit.description ?? '',
            color: unit.color ?? '#000000',
            evaluationName: unit.evaluationName,
            evaluationId: unit.evaluationId,
            published: unit.published ?? false,
            freeProgress: unit.freeProgress ?? false,
            expiresAt: timeToString(unit.expiresAt) ?? '2000-01-01'
        })
    }

    const handleInputChange = (e) => {
        setModified(true)
        console.log('handleInputChange', e)
        const { name, value, checked } = e.target
        let finalValue = value
        //if (name === 'position') finalValue = parseInt(value, 10)
        if ([ 'published', 'freeProgress' ].includes(name)) finalValue = checked

        setFormData((prev) => ({
            ...prev,
            [name]: finalValue,
        }))
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name) return alert('Nombre es obligatorio')
        
        const expiresAt = stringToTime(formData.expiresAt)

        try {
            if (unit.id) {
            // Update Action
                const allUnits = await API.updateUnit({ ...formData, expiresAt })
                //setSelectedUnitId(null)
                updateCallback('updated',allUnits)
            } else {
            // Create Action
                const allUnits = await API.updateUnit({...formData, expiresAt})
                updateCallback('added', allUnits)
            }
            //alert('Datos Guardados')
        } catch (err) {
            console.error('Save failed', err)
        }
    }
    
    const cancelEdit = (e) => {
        e.preventDefault()
        updateCallback('canceled', unit)
        setModified(false)
        resetFormData()
    }
    
    const handleDelete = async (e) => {
        e.preventDefault()

        if (!window.confirm('Estas seguro de eliminar esta Unidad? Se borrarán tambien todos sus Contenidos')) return
        try {
            const allUnits = await API.delete(unit)
            updateCallback('removed', allUnits)
        } catch (err) {
            console.error('Delete failed', err)
        }
    }

    return (
        <form
            style={{
                width: '350px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
            onSubmit={handleSubmit}
        >
            <div className={styles.form}>
                <input
                    name='id'
                    type='hidden'
                    value={formData.id}
                />
                <div className={styles.inputWrapper}>
                    <label
                        className={styles.label}
                    >Nombre</label>
                    <input
                        type='text'
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder='Nombre Unidad'
                        required
                        className={styles.input}
                    />
                </div>

                <div
                    className={styles.inputWrapper}
                    style={{alignItems: 'baseline'}}>
                    <label
                        className={styles.label}
                    >Descripción</label>
                    <textarea
                        type='text'
                        name='description'
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder='Descripción unidad'
                        className={styles.textArea}
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.label} > Color </label>
                    <input
                        type='color'
                        name='color'
                        className={styles.color}
                        value={formData.color}
                        onChange={handleInputChange}
                    />
                </div>

                { unit.id &&
                <div className={styles.inputWrapper}>
                    <label className={styles.label}> Evaluación </label>
                    <input
                        type='text'
                        name='evaluationName'
                        readOnly
                        className={`${styles.input} ${styles.readOnly}`}
                        value={formData.evaluationName}
                        onChange={handleInputChange}
                    />
                </div> }                

                { unit.id && !formData.evaluationId
                    ? <div className={styles.errorMessage}>
                        No se pudo encontrar esta evaluación en BlackBoard
                    </div>
                    : null }

                <div className={styles.inputWrapper}>
                    <label
                        className={styles.label}
                    >Publicado</label>
                    <Tooltip
                        title={'Controla si el contenido se muestra a los alumnos'}
                        placement='bottom'
                        arrow
                    >
                        <Switch
                            name='published'
                            checked={formData.published}
                            onChange={handleInputChange}
                            color='primary'
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </Tooltip>
                </div>

                <div className={styles.inputWrapper}>
                    <label
                        className={styles.label}
                    >Progreso Libre</label>
                    <Tooltip
                        title={`Controla como el estudiante puede avanzar 
                            por los contenidos. Si se activa el estudiante puede 
                            acceder a los contenidos sin la necesidad de haber 
                            completado el contenido previo`}
                        placement='bottom'
                        arrow
                    >
                        <Switch
                            name='freeProgress'
                            checked={formData.freeProgress}
                            onChange={handleInputChange}
                            color='primary'
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </Tooltip>

                </div>

                <div className={styles.inputWrapper}>
                    <label
                        className={styles.label}
                    >Fecha de Término</label>
                    <Tooltip
                        title={'Fecha en que se cierra la unidad'}
                        placement='bottom'
                        arrow
                    >
                        <TextField
                            name='expiresAt'
                            type='date'
                            defaultValue={getTodayString()}
                            className=''
                            value={formData.expiresAt ?? getTodayString()}
                            color='primary'
                            onChange={handleInputChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Tooltip>
                </div>

            </div>
            
            <hr />
            <div className={styles.buttons}>


                {cancel && (
                    <Button
                        variant='outlined'
                        color='primary'
                        size='small'
                        startIcon={<CloseIcon />}
                        style={{ height: '30px' }}
                        onClick={cancelEdit} 
                    >
                        {modified ? 'Cancelar' : 'Cerrar'}
                    </Button>
                )}

                {unit.id && (
                    <Button
                        variant='outlined'
                        color='primary'
                        size='small'
                        startIcon={<DeleteIcon />}
                        style={{ height: '30px' }}
                        onClick={handleDelete}
                    > Eliminar
                    </Button>
                )}

                {modified && (
                    <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        size='small'
                        startIcon={<SaveIcon />}
                        style={{ height: '30px' }}
                    >
                        {unit.id ? 'Actualizar' : 'Agregar'}
                    </Button>
                )}
            </div>
        </form>
    )
}