import React, {useState, useEffect} from 'react';
import TextField from "@material-ui/core/TextField";

const BaseInputValue = ({entry: {value}, property, currentValues, style, submitButtonRef, onChange, ...otherProps}) => {
    const [localValue, setLocalValue] = useState(value);
    const [shouldManualSubmit, setShouldManualSubmit] = useState(false);

    useEffect(() => {
        // console.log({value});

        setLocalValue(value);

        // This is to make sure that the out state is updated before calling the submit button

        if (shouldManualSubmit) {
            console.log({shouldManualSubmit});
            submitButtonRef.current.click();
            setShouldManualSubmit(false);
        }
    }, [shouldManualSubmit, submitButtonRef, value]);

    const handleChange = (e) => {
        // console.log({value: e.target.value});
        console.log('handleChange', e.target.value);


        setLocalValue(e.target.value);
    };

    const updateOuterState = () => {

        console.log('handleBlur');
        // const {onChange, entry: {value: oldValue}, property} = this.props;
        // const {value: newValue} = this.state;

        // Only store the new values if either
        // 1: the property allows only a single value (Not to add empty values to properties accepting multiple values)
        // 2: the new value is different from the old one
        // 3: the user has removed the existing value
        if (property.maxValuesCount === 1 || localValue !== value || (!localValue && value)) {
            console.log({onChange: localValue});

            onChange({value: localValue});
            // this.updateState();
        }
    };

    // updateState = () => {
    //     this.setState({value: this.props.entry.value});
    // }


    return (
        <TextField
            {...otherProps}
            multiline={property.multiLine}
            value={localValue}
            onChange={handleChange}
            onBlur={updateOuterState}
            onKeyDown={(e) => {
                // e.preventDefault();

                if (e.keyCode === 13) {
                    // console.log({keyCode: e.keyCode});


                    updateOuterState();
                    // If it's ctrl and is multiline
                    if (e.ctrlKey && property.multiLine) {
                        console.log('ctrl+enter', {localValue});
                        e.preventDefault();
                        e.stopPropagation();
                        // submitButtonRef.current.click();
                        setShouldManualSubmit(true)
                    }

                    if (!e.ctrlKey && !property.multiLine) {
                        console.log('enter', {localValue, submitButtonRef});

                        e.preventDefault();
                        e.stopPropagation();
                        // submitButtonRef.current.click();
                        setShouldManualSubmit(true)
                    }
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
