import React from 'react';
import Icon from "@material-ui/core/Icon";
import Typography from "@material-ui/core/Typography";

const MessageDisplay = ({
    message, isError = true, withIcon = true,
    small = false, noMessage = false, variant = "body2",
    color = 'inherit', messageColor = 'default',
}) => (
    <div style={{textAlign: 'center', padding: 10}}>
        {withIcon && (
            <Icon style={{fontSize: small ? '2em' : '4em', marginBottom: noMessage ? '' : 10}} color={color}>
                {isError ? 'error_outline' : 'priority_high'}
            </Icon>
        )}
        {!noMessage && (
            <Typography variant={variant} noWrap color={messageColor}>
                <span>
                    {message || 'An error occurred'}
                </span>
            </Typography>
        )}
    </div>
);

export default MessageDisplay;
