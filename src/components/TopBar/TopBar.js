import React from 'react';
import './TopBar.css';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import config from "../../config";

function TopBar(props) {
    const { classes } = props;

    const logout = () => { window.location.href = config.logoutUrl }

    return (
        <AppBar position="absolute" className={classes.appBar}>
            <Toolbar>
                <Typography variant="title" color="inherit" noWrap className={classes.flex}>
                    Workspace name
                </Typography>
                <Button color="inherit" onClick={logout}>Logout</Button>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;


