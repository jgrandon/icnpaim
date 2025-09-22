import React from 'react';
import { v4 as uuidv4 } from 'uuid';


export const ProgressIndicator = (props) => {
    const { 
        isActive = {},
        isFirst = false,
        isLast = false,
        isPrevActive=false
    } = props
    const pipeHeights = {
        full: '-webkit-fill-available',
        half: '50%', 
    }
    const pipeTops = {
        regular: 0,
        first: '50%',
        last: '-50%', 
    }
    const pipe = {
        height: isFirst || isLast ? pipeHeights.half : pipeHeights.full,
        top: isFirst ? (pipeTops.first) 
            : (isLast ? pipeTops.last : pipeTops.regular)
        
    }
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
                    backgroundColor: isFirst
                    ? 'white'
                    : isPrevActive ? '#4caf50' : '#aaaaaaff',
                    width: 5,
                    height: 50,
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
                    backgroundColor: isActive ? '#4caf50' : '#aaaaaaff',
                    height: 10,
                    width: 10,
                    border: '2px solid white',
                    borderRadius: '5px',
                    zIndex: 2
                }}
            />

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