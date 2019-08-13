import React, {useState, useEffect} from 'react';
import TextField from "@material-ui/core/TextField";

const BaseInputValue = ({entry: {value}, property: {maxValuesCount, multiLine}, currentValues, style, onChange, onMultiLineCtrlEnter, ...otherProps}) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        // Only store the new values if either
        // 1: the property allows only a single value (Not to add empty values to properties accepting multiple values)
        // 2: the new value is different from the old one
        // 3: the user has removed the existing value
        if (maxValuesCount === 1 || localValue !== value || (!localValue && value)) {
            onChange({value: localValue});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localValue]);

    const handleChange = (e) => {
        setLocalValue(e.target.value);
    };

    return (
        <TextField
            {...otherProps}
            onKeyDown={(e) => {
                // If it's multiline and ctrl+enter then handle as submit
                if (multiLine && e.ctrlKey && e.keyCode === 13) {
                    e.preventDefault();
                    e.stopPropagation();
                    onMultiLineCtrlEnter();
                }
            }}
            multiline={multiLine}
            value={localValue}
            onChange={handleChange}
            margin="normal"
            style={{...style, marginTop: 0, width: '100%'}}
        />
    );
};

BaseInputValue.defaultProps = {
    entry: {value: ''}
};

export default BaseInputValue;
