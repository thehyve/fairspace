import React from 'react';
import {AppBar, Toolbar, Typography, withStyles} from "@material-ui/core";

import UserMenu from "../UserMenu/UserMenu";
import logout from "../../../../services/logout";
import SearchBar from '../../SearchBar';

const styles = theme => ({
    root: {
        zIndex: theme.zIndex.drawer + 1
    }
});

function TopBar({classes, workspaceName}) {
    return (
        <AppBar className={classes.root} position="fixed">
            <Toolbar>
                <Typography variant="h6" color="inherit" noWrap style={{flexGrow: 1}}>
                    {workspaceName}
                </Typography>
                <SearchBar />
                <UserMenu onLogout={logout} />
            </Toolbar>
        </AppBar>
    );
}

export default withStyles(styles)(TopBar);
