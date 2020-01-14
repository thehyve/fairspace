import React from "react";
import PropTypes from 'prop-types';
import {TextField} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";

/**
 * This component is an input field that is aware of it's touched (blur) state and will only error if it's touched
 */
const ControlledTextField = ({control: {value, touched, setValue, valid, declareTouched}, selectOptions = [], ...props}) => (
    <TextField
        {...props}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={declareTouched}
        error={touched && !valid}>
        {selectOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </TextField>
);

ControlledTextField.propTypes = {
    control: PropTypes.exact({
        value: PropTypes.any.isRequired,
        setValue: PropTypes.func.isRequired,
        valid: PropTypes.bool.isRequired,
        touched: PropTypes.bool.isRequired,
        declareTouched: PropTypes.func.isRequired,
        selectOptions: PropTypes.array
    }),
};

export default ControlledTextField;
