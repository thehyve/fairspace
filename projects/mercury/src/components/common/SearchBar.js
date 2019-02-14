import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {InputBase, withStyles} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import styles from './SearchBar.styles';
import {buildSearchUrl, getSearchTypeFromString, getSearchQueryFromString} from '../../utils/searchUtils';

class SearchBar extends React.Component {
    state = {
        value: getSearchQueryFromString(this.props.location.search)
    };

    handleChange = (event) => {
        this.setState({value: event.target.value});
    }

    handleKeyDown = (event) => {
        // if Enter is pressed and search has value
        if (event.keyCode === 13 && this.state.value) {
            const type = getSearchTypeFromString(this.props.location.search);
            const searchUrl = buildSearchUrl(type, this.state.value);
            this.props.history.push(searchUrl);
        }
    }

    render() {
        const {classes, placeholder} = this.props;

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
                    value={this.state.value}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                />
            </div>
        );
    }
}

SearchBar.propTypes = {
    classes: PropTypes.object.isRequired,
    placeholder: PropTypes.string
};

export default withRouter(withStyles(styles)(SearchBar));
