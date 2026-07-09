import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (children)}
        </div>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
}

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    }
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        height: 'auto',
        display: 'grid',
        gridTemplateColumns: '1fr 3fr'
    },
    rootHorizontal: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        '& .MuiTabs-flexContainer': {
            display: 'flex',
            justifyContent: 'space-evenly'
        }
    },
    leftAlignedTab: {
        '& .MuiTab-wrapper': {
            alignItems: 'center',
            textAlign: 'center',
        },
    },
    centeredTabPanel: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

export default function VerticalTabs(props) {
    const classes = useStyles()
    const [ children, setChildren ] = React.useState([])
    const [ value, setValue ] = React.useState(0)

    useEffect(() => {
        if (props.children.length == 0) return
        if (props.children.length <= value) {
            setValue(props.children.length - 1) // set last 
        }
        setChildren(props.children)
    }, [ props.children ])

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }
    return (
        <div className={props.orientation == 'horizontal' 
            ? classes.rootHorizontal 
            : classes.root
        }>
            <Tabs
                orientation={props.orientation ?? 'vertical'}
                variant='scrollable'
                value={value}
                onChange={handleChange}
                aria-label='Vertical tabs example'
            >
                {
                    React.Children.map(children, (child, index) => (
                        <Tab 
                            label={child.props['data-title']} {...a11yProps(index)}
                            className={ props.orientation == 'vertical' 
                                ? classes.leftAlignedTab
                                : classes.centeredTab }
                            onClick={child.props['onClick']}
                        />
                    ))
                }
            </Tabs>

            <div>
                {
                    React.Children.map(children, (child, index) => (
                        <TabPanel 
                            value={value}
                            index={index}
                            className={classes.centeredTabPanel}
                        >
                            {child}
                        </TabPanel>
                    ))
                }
            </div>

        </div>
    )
}
