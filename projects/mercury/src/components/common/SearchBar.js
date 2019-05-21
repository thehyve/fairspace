import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {InputBase, withStyles} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import styles from './SearchBar.styles';

const SearchBar = ({
    classes, query = '', placeholder, onSearchChange = () => {}
}) => {
    const [value, setValue] = useState(query);
    const [keyDown, setKeyDown] = useState({key: null, shouldHandle: false});

    const handleChange = (event) => {
        setValue(event.target.value);

        if (keyDown.shouldHandle) {
            onSearchChange(keyDown.key, event.target.value);
            setKeyDown({key: null, shouldHandle: false});
        }
    };

    const handleOnKeyDown = ({key}) => {
        if (key === 'Enter') {
            onSearchChange(key, value);
        } else {
            setKeyDown({key, shouldHandle: true});
        }
    };

    return (
        <div className={classes.search}>
            <div className={classes.searchIcon}>
                <SearchIcon />
            </div>
            <InputBase
                placeholder={placeholder}
                classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                }}
                value={value}
                onChange={handleChange}
                onKeyDown={handleOnKeyDown}
            />
        </div>
    );
};

SearchBar.propTypes = {
    classes: PropTypes.object.isRequired,
    placeholder: PropTypes.string
};

export default withStyles(styles)(SearchBar);
