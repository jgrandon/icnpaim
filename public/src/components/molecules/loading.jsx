import React from 'react'
import {
  CircularProgress,
  Typography
} from '@material-ui/core';
export default function Loading (props) {
    return <div styles={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 400
    }}>
        <CircularProgress size={60} />
        <Typography variant="h6" style={{ marginLeft: 16 }}>
            {props.text}
        </Typography>
    </div>

}