import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {TextField} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {compareBy} from '@fairspace/shared-frontend';

const Dropdown = ({options, placeholder, async, loadOptions, isOptionDisabled, onChange, ...otherProps}) => {
    const [optionsToShow, setOptionsToShow] = useState([]);

    useEffect(() => {
        if (async && loadOptions) {
            loadOptions()
                .then(setOptionsToShow);
        } else {
            setOptionsToShow(options);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options]);

    return (
        <Autocomplete
            {...otherProps}
            onChange={(e, v) => {
                onChange(v);
            }}
            options={optionsToShow ? optionsToShow.sort(compareBy('disabled')) : optionsToShow}
            getOptionDisabled={option => (isOptionDisabled && isOptionDisabled(option)) || option.disabled}
            getOptionLabel={option => option.label}
            renderInput={(props) => <TextField fullWidth {...props} />}
        />
    );
};

Dropdown.propTypes = {
    onChange: PropTypes.func,
    options: PropTypes.array
};

export default Dropdown;
