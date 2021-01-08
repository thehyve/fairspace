import React from 'react';
import Typography from "@material-ui/core/Typography";
import {ErrorOutline, InfoOutlined} from '@material-ui/icons';

const MessageDisplay = ({
    message, isError = true, withIcon = true,
    small = false, variant = "body2",
    color = 'inherit', messageColor = 'inherit', noWrap = true
}) => {
    const style = small
        ? {fontSize: '2em', marginRight: 10, verticalAlign: 'middle'}
        : {fontSize: '4em', marginBottom: 10};
    return (
        <div style={{textAlign: 'center', padding: 10}}>
            <Typography variant={variant} noWrap={noWrap} color={messageColor}>
                {withIcon && (
                    isError ? <ErrorOutline style={style} color={color} /> : <InfoOutlined style={style} color={color} />
                )}
                {small ? null : <br />}
                <span>
                    {message || 'An error occurred'}
                </span>
            </Typography>
        </div>
    );
};

export default MessageDisplay;
