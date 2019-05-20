import React from 'react';
import {withRouter} from "react-router-dom";
import {AppBar, Toolbar, Typography, withStyles} from "@material-ui/core";

import UserMenu from "../UserMenu/UserMenu";
import logout from "../../../../services/logout";
import SearchBar from '../../SearchBar';
import {buildSearchUrl, getSearchQueryFromString} from '../../../../utils/searchUtils';

const styles = theme => ({
    root: {
        zIndex: theme.zIndex.drawer + 1
    },
    title: {
        flexGrow: 1
    }
});

const TopBar = ({classes, workspaceName, location, history}) => {
    const query = getSearchQueryFromString(location.search);

    const onKeyDown = (event, value) => {
        // if Enter is pressed and search has value
        if (event.keyCode === 13 && value) {
            const searchUrl = buildSearchUrl(value);
            history.push(searchUrl);
        }
    };

    return (
        <AppBar className={classes.root} position="sticky">
            <Toolbar>
                <Typography variant="h6" color="inherit" noWrap className={classes.title}>
                    {workspaceName}
                </Typography>
                <SearchBar query={query} onKeyDown={onKeyDown} />
                <UserMenu onLogout={logout} />
            </Toolbar>
        </AppBar>
    );
};

export default withRouter(withStyles(styles)(TopBar));
