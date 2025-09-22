import React from 'react';
import { v4 as uuidv4 } from 'uuid';


export const ProgressIndicator = (props) => {
    const { 
        isActive = {},
        isFirst = false,
        isLast = false,
        isPrevActive=false
    } = props

    const pipeColor = isActive ? '#4caf50' : '#aaaaaaff'
    const prevPipeColor = isPrevActive ? '#4caf50' : '#aaaaaaff'

    return (
        <div
            style={{
                height: '-webkit-fill-available',
                paddingLeft: 5,
                gridColumn: 2,
                display: 'grid',
                gridTemplateRows: '5fr 1fr 5fr',
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
                    width: 5,
                    height: 50
                }}
            />
            
            {/** 
             * border: `2px solid ${isCompleted ? '#308a33ff' : '#5e5e5eff'}`,
             * 
             */}

            {/** Node */}
            <div
                key={uuidv4()}
                style={{
                    backgroundColor: 'white',
                    height: 15,
                    width: 15,
                    border: `2px solid ${pipeColor}`,
                    borderRadius: '10px',
                    zIndex: 2,
                    display: 'grid',
                    alignContent: 'center',
                    justifyContent: 'center'
                }}
            >
                {/** inner circle */}
                <div style={{
                    backgroundColor: pipeColor,
                    width: 9,
                    height: 9,
                    borderRadius: 5
                }}/>
            </div>

            {/** Pipe */}
            <div 
                key={uuidv4()}
                style={{
                    backgroundColor: isLast
                    ? 'white'
                    : isActive ? '#4caf50' : '#aaaaaaff',
                    width: 5,
                    height: 50,
                }}
            />

        </div>
    )
}