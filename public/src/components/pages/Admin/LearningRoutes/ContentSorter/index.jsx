import React, { useEffect, useState } from 'react'
import { ReactSortable } from 'react-sortablejs'
import Content from '../../Content'
import { v4 as uuidv4 } from 'uuid'

export default function ContentSorter ({ 
    contents, 
    onChange = () => {}
}) {
    const [ sorted, setSorted ] = useState(contents)
/*
    useEffect(()=> {
        setSorted(contents)
    }, [])
*/
    return (
        <div>
            <ReactSortable 
                list={sorted}
                setList={setSorted}
                onSort={() => {
                    console.log('onSort', sorted)
                    onChange([ ...sorted ])}
                }
                onChange={() => console.log('onChange')}
                onUpdate={() => console.log('onUpdate', )}    
            >
                {sorted.map((item) => (
                    <div key={item.id}>
                        <Content
                            key={uuidv4()}
                            content={item}
                            onClick={() => {}} 
                        />
                    </div>
                ))}
            </ReactSortable>
        </div>
    )
}