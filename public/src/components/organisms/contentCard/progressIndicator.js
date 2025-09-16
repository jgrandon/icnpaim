import React from 'react';
import { v4 as uuidv4 } from 'uuid';


export const ProgressIndicator = (props) => {
    const { 
        isActive = {},
        isFirst = false,
        isLast = false,
    } = props
    const pipeHeights = {
        full: '-webkit-fill-available',
        half: '-webkit-fill-available/2', 
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
                border: `2px solid ${isCompleted ? '#308a33ff' : '#5e5e5eff'}`,
                height: '-webkit-fill-available',
                display: 'flex',
                alignItems: 'center',
            }}
        >
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
                    borderRadius: '5px'
                }}
            />
            
            {/** Pipe */}
            <div 
                key={uuidv4()}
                style={{
                    backgroundColor: isActive ? '#4caf50' : '#aaaaaaff',
                    width: 5,
                    height: pipe.height,
                    top: pipe.top
                }}
            />

        </div>
    )
}