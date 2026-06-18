import React, { useState, useEffect } from 'react'
import ContentsAPI from '../../../../services/contents'
import { v4 as uuidv4 } from 'uuid'


export default function ContentPicker (props) {
    const { learningRoute } = props
    const [ contents, setContents ]= useState(learningRoute.contents)
    const [ selectedContents, setSelectedContents ] = useState([])

    useEffect(() => {
        loadContents()
    }, [])

    const loadContents = async () => {
        const { unitId } = learningRoute
        const data = await ContentsAPI.getAll(unitId)
        setContents(data)
    }

    const removeContent = (content) => selectedContents.filter(sc => sc.title =! content.title)
    const addContent = (content) => setSelectedContents([ ...selectedContents, content ])

    const handleClick = (content) => {
        if (isSelected(content)) removeContent(content)
        else addContent(content)
    }

    const isSelected = (content) => {
        return selectedContents.filter(sc => sc.title == content.title)
    }

    return (
        <div>
            { 
                contents.map( c => (
                    <div key={ uuidv4() }
                        onClick={() => handleClick(c)}
                        style={{
                            backgroundColor: isSelected(c) ? 'gray' : 'none'
                        }}
                    >
                        <div>=</div>
                        <div>{ c.title }</div>
                    </div>
                ))
            }
        </div>
    )
}