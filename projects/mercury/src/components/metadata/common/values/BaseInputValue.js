import React, {useState, useEffect} from 'react';
import TextField from "@material-ui/core/TextField";

const BaseInputValue = ({entry: {value}, property, currentValues, style, submitButtonRef, onChange, ...otherProps}) => {
    const [localValue, setLocalValue] = useState(value);
    const [shouldManualSubmit, setShouldManualSubmit] = useState(false);

    useEffect(() => {
        setLocalValue(value);

        // This is to make sure that the outer state is updated before calling the submit button
        if (shouldManualSubmit) {
            submitButtonRef.current.click();
            setShouldManualSubmit(false);
        }
    }, [shouldManualSubmit, submitButtonRef, value]);

    const handleChange = (e) => {
        setLocalValue(e.target.value);
    };

    const updateOuterState = () => {
        // Only store the new values if either
        // 1: the property allows only a single value (Not to add empty values to properties accepting multiple values)
        // 2: the new value is different from the old one
        // 3: the user has removed the existing value
        if (property.maxValuesCount === 1 || localValue !== value || (!localValue && value)) {
            onChange({value: localValue});
        }
    };

    return (
        <TextField
            {...otherProps}
            multiline={property.multiLine}
            value={localValue}
            onChange={handleChange}
            onBlur={updateOuterState}
            onKeyDown={(e) => {
                // Enter
                if (e.keyCode === 13) {
                    // If it's ctrl and is multiline
                    if (e.ctrlKey && property.multiLine) {
                        e.preventDefault();
                        e.stopPropagation();
                        setShouldManualSubmit(true);
                    }

                    if (!e.ctrlKey && !property.multiLine) {
                        e.preventDefault();
                        e.stopPropagation();
                        setShouldManualSubmit(true);
                    }
                    updateOuterState();
                }
            }}
            margin="normal"
            style={{...style, marginTop: 0, width: '100%'}}
        />
    );
};

BaseInputValue.defaultProps = {
    entry: {value: ''}
};

export default BaseInputValue;
