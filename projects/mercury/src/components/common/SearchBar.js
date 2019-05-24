import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {InputBase, withStyles} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import styles from './SearchBar.styles';

const SearchBar = ({
    classes, query = '', placeholder, onSearchChange = () => {}
}) => {
    const [value, setValue] = useState(query);

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
                <InputBase
                    placeholder={placeholder}
                    classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                    }}
                    value={value}
                    onChange={handleChange}
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
