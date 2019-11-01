import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {TextField} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {compareBy, MaterialReactSelect} from '@fairspace/shared-frontend';

const Dropdown = ({options, placeholder, async, value, loadOptions, isOptionDisabled, onChange, ...otherProps}) => {
    const [optionsToShow, setOptionsToShow] = useState(options);
    const [textFieldValue, setTextFieldValue] = useState(placeholder);

    useEffect(() => {
        if (async && loadOptions) {
            loadOptions()
                .then(setOptionsToShow);
        }
    }, [async, loadOptions, options]);

    const InputComponent = (props) => (
        <TextField
            // value={textFieldValue}
            // onChange={e => setTextFieldValue(e.target.value)}
            fullWidth
            {...props}
        />
    );

    return (
        <Autocomplete
            onChange={(e, v) => {
                onChange(v);
                // clear textfield text after a selection is done
                setTextFieldValue('');
            }}
            value={value}
            options={optionsToShow ? optionsToShow.sort(compareBy('disabled')) : optionsToShow}
            getOptionDisabled={option => (isOptionDisabled && isOptionDisabled(option)) || option.disabled}
            getOptionLabel={option => option.label}
            {...otherProps}
            // renderInput={(props) => <TextField fullWidth {...props} />}
            renderInput={InputComponent}
        />
    );
};

// (
//     <MaterialReactSelect
//         style={{width: '100%'}}
//         {...otherProps}
//         options={options ? options.sort(compareBy('disabled')) : options}
//     />
// );


Dropdown.propTypes = {
    onChange: PropTypes.func,
    options: PropTypes.array
};

export default Dropdown;
