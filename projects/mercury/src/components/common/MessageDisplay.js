import React from 'react';
import Icon from "@material-ui/core/Icon";
import Typography from "@material-ui/core/Typography";

const MessageDisplay = ({message, isError = true, withIcon = true}) => (
    <div style={{textAlign: 'center', padding: 10}}>
        {withIcon && (
            <Icon style={{fontSize: '4em', marginBottom: 10}}>
                {isError ? 'error_outline' : 'priority_high'}
            </Icon>
        )}
        <Typography noWrap>
            <span>
                {message || 'An error occurred'}
            </span>
        </Typography>
    </div>
);

export default MessageDisplay;
