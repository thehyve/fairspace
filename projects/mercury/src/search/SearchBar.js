import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {TextField, withStyles} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import styles from './SearchBar.styles';

const SearchBar = ({
    classes, query = '', placeholder, onSearchChange = () => {}, disabled = false, width = '100%'
}) => {
    const [origQuery, setOrigQuery] = useState(query);
    const [value, setValue] = useState(query);

    if (query !== origQuery) { // check if query was reset by the owner
        setOrigQuery(query);
        setValue(query);
    }

    const handleSearch = (e) => {
        e.preventDefault();
        onSearchChange(value);
    };

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            handleSearch(e);
        }
    };

    return (
        <div className={classes.search}>
            <TextField
                placeholder={placeholder}
                classes={{
                    root: classes.inputRoot,
                }}
                style={{width}}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                type="search"
                disabled={disabled}
                InputProps={{
                    classes: {
                        input: classes.inputInput,
                        adornedEnd: classes.adornedEnd
                    },
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleSearch}
                                className={classes.searchIcon}
                                title="Apply filter"
                                color="primary"
                            >
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
        </div>
    );
};

SearchBar.propTypes = {
    classes: PropTypes.object.isRequired,
    placeholder: PropTypes.string
};

export default withStyles(styles)(SearchBar);
