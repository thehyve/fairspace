import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {TextField} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import useIsMounted from 'react-is-mounted-hook';
import {compareBy} from "../../../common/utils/genericUtils";

const Dropdown = ({
    options = null, clearTextOnSelection = true, placeholder,
    loadOptions, loadOptionsOnMount = true, isOptionDisabled, onChange, value,
    autoFocus = false, ...otherProps
}) => {
    const [optionsToShow, setOptionsToShow] = useState(options);
    const [searchText, setSearchText] = useState('');
    const [touched, setTouched] = useState(loadOptionsOnMount);

    const isMounted = useIsMounted();

    useEffect(() => {
        if (isMounted()) {
            if (loadOptions && touched) {
                loadOptions(searchText.length < 3 ? '' : searchText)
                    .then(setOptionsToShow);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, touched]);

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
                onChange(v);
                if (isMounted() && clearTextOnSelection) {
                    setSearchText('');
                }
                inputRef.current.blur();
            }}
            blurOnSelect
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
