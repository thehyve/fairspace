import React from 'react';
import {AppBar, Toolbar, Typography, withStyles} from "@material-ui/core";

import UserMenu from "../UserMenu/UserMenu";
import logout from "../../../../services/logout";
import SearchBar from '../../SearchBar';

const styles = theme => ({
    root: {
        zIndex: theme.zIndex.drawer + 1
    },
    title: {
        flexGrow: 1
    }
});

const TopBar = ({classes, workspaceName}) => (
    <AppBar className={classes.root} position="fixed">
        <Toolbar>
            <Typography variant="h6" color="inherit" noWrap className={classes.title}>
                {workspaceName}
            </Typography>
            <SearchBar />
            <UserMenu onLogout={logout} />
        </Toolbar>
    </AppBar>
);

export default withStyles(styles)(TopBar);
