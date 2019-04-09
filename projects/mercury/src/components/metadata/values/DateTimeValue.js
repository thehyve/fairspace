import React from 'react';
import TextField from "@material-ui/core/TextField";

const localize = (dt) => (dt && dt.endsWith('Z') ? dt.substring(0, dt.length - 1) : dt);

const delocalize = (dt) => (dt ? `${dt}Z` : dt);

const DateTimeValue = ({entry, property, style, onSave, ...otherProps}) => (
    <TextField
        {...otherProps}
        multiline={false}
        value={localize(entry.value)}
        type="datetime-local"
        onChange={e => delocalize(e.target.value)}
        margin="normal"
        style={{...style, marginTop: 0, width: '100%'}}
    />
);

DateTimeValue.defaultProps = {
    entry: {}
};

export default DateTimeValue;
