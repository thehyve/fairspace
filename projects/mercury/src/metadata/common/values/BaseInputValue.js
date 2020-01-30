import React, {useEffect, useState} from 'react';
import TextField from "@material-ui/core/TextField";

const BaseInputValue = ({entry: {value}, property, currentValues, style, onChange, ...otherProps}) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e) => {
        setLocalValue(e.target.value);
    };

    const updateOuterState = (newValue) => {
        // Only store the new values if either
        // 1: the property allows only a single value (Not to add empty values to properties accepting multiple values)
        // 2: the new value is different from the old one
        // 3: the user has removed the existing value
        if (property.maxValuesCount === 1 || newValue !== value || (!newValue && value)) {
            onChange({value: newValue});
        }
    };

    return (
        <TextField
            {...otherProps}
            margin="dense"
            multiline={property.multiLine}
            value={localValue}
            onChange={handleChange}
            onBlur={(e) => {
                updateOuterState(localValue);
                if (otherProps.onBlur) {
                    otherProps.onBlur(e);
                }
            }}
            onKeyUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateOuterState(e.target.value);
            }}
            style={{...style, marginTop: 0, width: '100%'}}
        />
    );
};

BaseInputValue.defaultProps = {
    entry: {value: ''}
};

export default BaseInputValue;
