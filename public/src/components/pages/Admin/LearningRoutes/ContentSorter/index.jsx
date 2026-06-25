import React, { useEffect, useState } from 'react'
import { ReactSortable } from 'react-sortablejs'
import Content from '../../Content'
import { v4 as uuidv4 } from 'uuid'

export default function ContentSorter ({ 
    contents, 
    onChange = () => {}
}) {
    const [ sorted, setSorted ] = useState()

    useEffect(()=> {
        setSorted(contents)
    }, [])


    return <ReactSortable list={sorted} setList={setSorted}>
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
}