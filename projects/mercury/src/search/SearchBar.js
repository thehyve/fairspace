import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Input, withStyles} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import styles from './SearchBar.styles';

const SearchBar = ({
    classes, query = '', placeholder, onSearchChange = () => {}, disableUnderline = true, disabled = false
}) => {
    const [origQuery, setOrigQuery] = useState(query);
    const [value, setValue] = useState(query);

    if (query !== origQuery) { // check if query was reset by the owner
        setOrigQuery(query);
        setValue(query);
    }

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        onSearchChange(value);
    };

    return (
        <div className={classes.search}>
            <div className={classes.searchIcon}>
                <SearchIcon />
            </div>
            <form
                onSubmit={handleSearch}
            >
                <Input
                    placeholder={placeholder}
                    classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                    }}
                    value={value}
                    onChange={handleChange}
                    disableUnderline={disableUnderline}
                    disabled={disabled}
                />
            </form>
        </div>
    );
};

SearchBar.propTypes = {
    classes: PropTypes.object.isRequired,
    placeholder: PropTypes.string
};

export default withStyles(styles)(SearchBar);
