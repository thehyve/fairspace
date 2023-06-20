// @ts-nocheck
import React from "react";
import Switch from "@mui/material/Switch";

// The error variable here is a boolean for error existence, the Switch component expects a string instead
const SwitchValue = ({
    entry,
    property,
    currentValues,
    style,
    onChange,
    error,
    ...otherProps
}) => <Switch {...otherProps} checked={!!entry.value} onChange={e => onChange({
    value: e.target.checked
})} />;

SwitchValue.defaultProps = {
    entry: {
        value: ''
    }
};
export default SwitchValue;