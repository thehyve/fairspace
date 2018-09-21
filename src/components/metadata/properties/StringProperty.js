import React from 'react'
import TextField from "@material-ui/core/TextField";

const StringProperty = ({property, entry, onChange}) =>
    <TextField
        multiline={property.multiLine}
        value={entry.value}
        onChange={e => onChange(e.target.value)}
        margin="normal"
    />

export default StringProperty;
