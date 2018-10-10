import React from 'react';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import UserMenu from "../UserMenu/UserMenu";
import {logout} from "../../App/logout";

function TopBar(props) {
    const { classes } = props;

    return (
        <AppBar position="absolute" className={classes.appBar}>
            <Toolbar>
                <Typography variant="h6" color="inherit" noWrap className={classes.flex}>
                    Workspace name
                </Typography>
                <UserMenu onLogout={logout}></UserMenu>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;


