import React from 'react';
import TextField from "@material-ui/core/TextField";

const BaseInputValue = ({entry, property, style, onChange, ...otherProps}) => (
    <TextField
        {...otherProps}
        multiline={property.multiLine}
        value={entry.value}
        onChange={e => onChange({value: e.target.value})}
        margin="normal"
        style={{...style, marginTop: 0, width: '100%'}}
    />
);

BaseInputValue.defaultProps = {
    entry: {value: ''}
};

export default BaseInputValue;
