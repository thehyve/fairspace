import React from 'react';
import Switch from "@material-ui/core/Switch";

const SwitchValue = ({entry, property, style, onChange, ...otherProps}) => (
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
