import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {InputBase, withStyles} from '@material-ui/core';
import {fade} from '@material-ui/core/styles/colorManipulator';
import SearchIcon from '@material-ui/icons/Search';

import {buildSearchUrl, getSearchTypeFromString, getSearchQueryFromString} from '../../utils/searchUtils';

const styles = theme => ({
    search: {
        'position': 'relative',
        'flex': 0.8,
        'borderRadius': theme.shape.borderRadius,
        'backgroundColor': fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        'marginLeft': 0,
        'width': '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing.unit,
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing.unit * 9,
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
    },
    inputInput: {
        paddingTop: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        paddingLeft: theme.spacing.unit * 10,
        transition: theme.transitions.create('width'),
        width: '100%',
    },
});

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
