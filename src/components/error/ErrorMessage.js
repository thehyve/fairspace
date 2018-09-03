import React from 'react';
import Icon from "@material-ui/core/Icon";
import Typography from "@material-ui/core/Typography";

/**
 * This component is displayed when an error has occurred.
 */
function ErrorMessage(props) {
    return (<div style={{textAlign: 'center', margin: 10}}>
        <Icon style={{fontSize: '4em', marginBottom: 10}}>error_outline</Icon>
        <Typography noWrap>
            <span>{props.message || 'An error occurred'}</span>
        </Typography>
    </div>);
}

export default ErrorMessage;
