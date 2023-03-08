import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Autocomplete, ListItemText, TextField} from '@mui/material';
import useIsMounted from 'react-is-mounted-hook';
import {compareBy} from "../../../common/utils/genericUtils";

const Dropdown = ({
    options = null, clearTextOnSelection, placeholder,
    loadOptions, loadOptionsOnMount = true, isOptionDisabled, onChange, value,
    autoFocus = false, label, ...otherProps
}) => {
    const [optionsToShow, setOptionsToShow] = useState(options);
    const [searchText, setSearchText] = useState('');
    const [touched, setTouched] = useState(loadOptionsOnMount);

    const isMounted = useIsMounted();

    useEffect(() => {
        if (isMounted()) {
            if (loadOptions && touched) {
                loadOptions(searchText)
                    .then(setOptionsToShow);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, touched]);

    useEffect(() => {
        setOptionsToShow(options);
    }, [options]);

    const inputProps = (params) => ({
        ...params.inputProps,
        value: searchText,
        onChange: (e) => isMounted() && setSearchText(e.target.value),
        onFocus: () => setTouched(true),
        onClick: () => setTouched(true)
    });

    const inputRef = React.createRef();

    return (
        <Autocomplete
            {...otherProps}
            value={value}
            onChange={(e, v) => {
                if (onChange) {
                    onChange(v);
                }
                if (isMounted() && clearTextOnSelection) {
                    setSearchText('');
                }
                inputRef.current.blur();
            }}
            loading={optionsToShow == null}
            onOpen={() => setTouched(true)}
            options={optionsToShow ? optionsToShow.sort(compareBy('disabled')) : []}
            getOptionDisabled={option => (isOptionDisabled && isOptionDisabled(option))}
            getOptionLabel={option => option.label}
            renderInput={(params) => (
                <TextField
                    autoFocus={autoFocus}
                    fullWidth
                    {...params}
                    inputProps={clearTextOnSelection ? inputProps(params) : params.inputProps}
                    inputRef={inputRef}
                    label={label}
                />
            )}
            renderOption={(props, option) => (
                <ListItemText {...props} primary={option.label} secondary={option.description} />
            )}
        />
    );
};

Dropdown.propTypes = {
    onChange: PropTypes.func,
    options: PropTypes.array
};

export default Dropdown;
