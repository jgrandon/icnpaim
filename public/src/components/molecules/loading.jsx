import React from 'react'
import {
  CircularProgress,
  Typography
} from '@material-ui/core';
export default function Loading (props) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      width: 'stretch',
      alignItems: 'center',
      minHeight: 400
    }}>
        <CircularProgress size={60} />
        <Typography variant="h6" style={{ marginLeft: 16 }}>
            {props.text}
        </Typography>
    </div>

}