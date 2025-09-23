import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { _OK_GREEN, _INACTIVE_GRAY } from './colors'

export const ProgressIndicator = (props) => {
    const { 
        isActive = {},
        isFirst = false,
        isLast = false,
        isNextActive=false
    } = props

    const pipeColor = isActive ? _OK_GREEN :_INACTIVE_GRAY
    const nextPipeColor = isNextActive ? _OK_GREEN : _INACTIVE_GRAY

    return (
        <div
            style={{
                height: '-webkit-fill-available',
                paddingLeft: 5,
                gridColumn: 2,
                display: 'grid',
                gridTemplateRows: '3fr 1fr 3fr',
                gridRowStart: 1,
                justifyContent: 'center',
                justifyItems: 'center',
                alignItems: 'center'
            }}
        >
            {/** Pipe */}
            <div
                key={uuidv4()}
                style={{
                    backgroundColor: isFirst ? 'white' : pipeColor,
                    width: 5,
                    height: 50
                }}
            />

            {/** Node */}
            <div
                key={uuidv4()}
                style={{
                    backgroundColor:pipeColor,
                    height: 15,
                    width: 15,
                    border: `4px solid white`,
                    borderRadius: '10px',
                    zIndex: 2,
                    display: 'grid',
                    alignContent: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                }}
            />

            {/** Pipe */}
            <div
                key={uuidv4()}
                style={{
                    backgroundColor: isLast ? 'white' : nextPipeColor,
                    width: 5,
                    height: 50
                }}
            />

        </div>
    )
}