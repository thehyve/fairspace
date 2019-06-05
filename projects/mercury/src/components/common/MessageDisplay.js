import React from 'react';
import Icon from "@material-ui/core/Icon";
import Typography from "@material-ui/core/Typography";

const MessageDisplay = ({message, isError = true, noIcon = false}) => (
    <div style={{textAlign: 'center', padding: 10}}>
        {!noIcon && (
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
