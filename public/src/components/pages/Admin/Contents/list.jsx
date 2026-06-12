import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'

export default function ContentsList ({
    contents,
    onEdit,
    onRemove
}) {
    
    return (
        <div>
            {
                contents.map((c) => (
                    <Accordion
                        key={uuidv4()}
                    >
                        <AccordionSummary>
                            <div>{c.title}</div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div>
                                <div>{c.description}</div>
                                <div>{c.type}</div>
                                <div>{c.url}</div>
                            </div>
                            <button onClick={() => onEdit(c)}>Editar</button>
                            <button onClick={() => onRemove(c)}>eliminar</button>
                        </AccordionDetails>
                    </Accordion>
                ))
            }
        </div>
    )
}