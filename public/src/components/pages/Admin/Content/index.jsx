import React from 'react'
import * as styles from './content.module.css'

export default function Content (props) {
    const { content, onClick } = props

    return (
        <div
            className={styles.content}
            onClick={() => onClick(content)}
        >
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{content.title}</h2>
                    <span className={styles.badge}>{content.type}</span>
                </div>
                <a
                    href={content.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={styles.link}>
                    {content.url}
                </a>
            </div>
        </div>
    )
}