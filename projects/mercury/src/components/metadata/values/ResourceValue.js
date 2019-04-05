import React from 'react';
import TextField from "@material-ui/core/TextField";

const ResourceValue = ({property, entry, style, onChange, ...otherProps}) => (
    <TextField
        {...otherProps}
        multiline={property.multiLine}
        value={entry.id}
        onChange={e => onChange({id: new URL(e.target.value).toString()})}
        margin="normal"
        style={{...style, marginTop: 0, width: '100%'}}
        type="url"
    />
);

ResourceValue.defaultProps = {
    entry: {}
};

export default ResourceValue;
