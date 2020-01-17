import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {TextField} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import useIsMounted from 'react-is-mounted-hook';
import {compareBy} from '../../../common';

const Dropdown = ({
    options, clearTextOnSelection = true, placeholder, async,
    loadOptions, loadOptionsOnMount = true, isOptionDisabled, onChange, value,
    autoFocus = false, ...otherProps
}) => {
    const [optionsToShow, setOptionsToShow] = useState(async && options ? options : []);
    const [searchText, setSearchText] = useState('');
    const [touched, setTouched] = useState(loadOptionsOnMount);

    const isMounted = useIsMounted();

    useEffect(() => {
        if (isMounted()) {
            if (async && loadOptions && touched) {
                loadOptions(searchText)
                    .then(setOptionsToShow);
            } else {
                setOptionsToShow(options);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [async, searchText, options, touched]);

    const inputProps = (params) => ({
        ...params.inputProps,
        value: searchText,
        onChange: (e) => isMounted() && setSearchText(e.target.value),
        onClick: () => setTouched(true)
    });

    return (
        <Autocomplete
            {...otherProps}
            value={value}
            onChange={(e, v) => {
                onChange(v);
                if (clearTextOnSelection && isMounted()) {
                    setSearchText('');
                }
            }}
            options={optionsToShow ? optionsToShow.sort(compareBy('disabled')) : optionsToShow}
            getOptionDisabled={option => (isOptionDisabled && isOptionDisabled(option))}
            getOptionLabel={option => option.label}
            renderInput={(params) => (
                <TextField
                    autoFocus={autoFocus}
                    fullWidth
                    {...params}
                    inputProps={clearTextOnSelection ? inputProps(params) : params.inputProps}
                />
            )}
        />
    );
};

Dropdown.propTypes = {
    onChange: PropTypes.func,
    options: PropTypes.array
};

export default Dropdown;
