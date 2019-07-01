import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {InputBase, withStyles} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import {withRouter} from "react-router-dom";
import styles from './SearchBar.styles';
import {getSearchQueryFromString} from "../../utils/searchUtils";

const SearchBar = ({
    classes, query = '', placeholder, history, onSearchChange = () => {}
}) => {
    const [value, setValue] = useState(query);

    const resetValueFromLocation = () => setValue(getSearchQueryFromString(history.location.search));

    useEffect(() => history.listen(resetValueFromLocation));

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

export default withStyles(styles)(withRouter(SearchBar));
