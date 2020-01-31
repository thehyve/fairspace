import React from 'react';
import Typography from "@material-ui/core/Typography";
import {ErrorOutline, PriorityHigh} from '@material-ui/icons';

const MessageDisplay = ({
    message, isError = true, withIcon = true,
    small = false, variant = "body2",
    color = 'inherit', messageColor = 'inherit', noWrap = true
}) => {
    const style = {fontSize: small ? '2em' : '4em', marginBottom: 10};
    return (
        <div style={{textAlign: 'center', padding: 10}}>
            {withIcon && (
                isError ? <ErrorOutline style={style} color={color} /> : <PriorityHigh style={style} color={color} />
            )}
            <Typography variant={variant} noWrap={noWrap} color={messageColor}>
                <span>
                    {message || 'An error occurred'}
                </span>
            </Typography>
        </div>
    );
};

export default MessageDisplay;
