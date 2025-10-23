import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { _OK_GREEN, _INACTIVE_GRAY } from './colors'
import { useResponsive } from '../../../hooks/useResponsive';

export const ProgressIndicator = (props) => {
    const { 
        isActive = {},
        prev = undefined,
        next = undefined,
        color = null
    } = props
    const windowWidth = useResponsive()
    const isFirst = prev == undefined
    const isLast = next == undefined
    const inactiveColor = color ?? _INACTIVE_GRAY
    const pipeColor = isActive ? _OK_GREEN : inactiveColor
    const nextPipeColor = next?.completed ? _OK_GREEN : inactiveColor
    const prevPipeColor = prev?.completed ? _OK_GREEN : inactiveColor

    return (
        <div
            style={{
                height: '-webkit-fill-available',
                paddingLeft: 5,
                gridColumn: windowWidth < 800 ? 1 : 2,
                display: 'grid',
                gridTemplateRows: '4fr 1fr 4fr',
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
                    backgroundColor: isFirst ? 'white' : prevPipeColor,
                    opacity: prev?.completed ? 1 : 0.5,
                    width: 5,
                    height: '6rem'
                }}
            />

            {/** Node */}
            <div
                key={uuidv4()}
                style={{
                    backgroundColor: pipeColor,
                    height: 24,
                    width: 24,
                    border: `4px solid white`,
                    borderRadius: '50%',
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
                    opacity: next?.completed ? 1 : 0.5,
                    width: 5,
                    height: '6rem'
                }}
            />
        </div>
    )
}