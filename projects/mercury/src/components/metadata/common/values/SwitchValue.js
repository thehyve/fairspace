import React from 'react';
import Switch from "@material-ui/core/Switch";

// The error variable here is a boolean for error existiance, the Switch component expects a string instead
const SwitchValue = ({entry, property, style, onChange, error, ...otherProps}) => (
    <Switch
        {...otherProps}
        checked={!!entry.value}
        onChange={e => onChange({value: e.target.checked})}
    />
);

SwitchValue.defaultProps = {
    entry: {value: ''}
};

export default SwitchValue;
