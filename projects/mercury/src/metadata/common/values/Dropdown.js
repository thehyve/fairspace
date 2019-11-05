import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {TextField} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {compareBy} from '@fairspace/shared-frontend';
import useIsMounted from 'react-is-mounted-hook';

const Dropdown = ({options, placeholder, async, loadOptions, isOptionDisabled, onChange, ...otherProps}) => {
    const [optionsToShow, setOptionsToShow] = useState([]);
    const [searchText, setSearchText] = useState('');

    const isMounted = useIsMounted();

    useEffect(() => {
        if (isMounted()) {
            if (async && loadOptions) {
                loadOptions()
                    .then(setOptionsToShow);
            } else {
                setOptionsToShow(options);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, searchText]);

    return (
        <Autocomplete
            {...otherProps}
            onChange={(e, v) => {
                onChange(v);
                if (isMounted()) {
                    setSearchText('');
                }
            }}
            options={optionsToShow ? optionsToShow.sort(compareBy('disabled')) : optionsToShow}
            getOptionDisabled={option => (isOptionDisabled && isOptionDisabled(option))}
            getOptionLabel={option => option.label}
            renderInput={(params) => (
                <TextField
                    fullWidth
                    {...params}
                    inputProps={{
                        ...params.inputProps,
                        value: searchText
                    }}
                    value={searchText}
                    onChange={(e) => isMounted() && setSearchText(e.target.value)}
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
