import React, { useState } from 'react'
import { ReactSortable } from 'react-sortablejs'
import Content from '../../Content'
import { v4 as uuidv4 } from 'uuid'
import * as styles from './ContentSorter.module.css'

export default function ContentSorter ({ 
    contents, 
    onChange = () => {}
}) {
    const [ sorted, setSorted ] = useState(contents)

    return (
        <div className={styles.wrapper}>
            <ReactSortable 
                list={sorted}
                setList={setSorted}
                onSort={() => {
                    console.log('onSort', sorted)
                    const data = sorted.map((d,index) =>  ({ ...d, order: index }))
                    onChange(data) 
                }}
                onChange={() => console.log('onChange')}
                onUpdate={() => console.log('onUpdate', )} 
            >
                {sorted.map((item) => (
                    <div key={item.id} style={{ cursor:'grab', margin: '5px 0px' }}>
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