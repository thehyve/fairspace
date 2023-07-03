import React from 'react';
import {withRouter} from "react-router-dom";
import {AppBar, Toolbar, Typography} from "@mui/material";

import withStyles from '@mui/styles/withStyles';

import UserMenu from "./UserMenu";

const styles = theme => ({
    root: {
        zIndex: theme.zIndex.drawer + 1
    },
    title: {
        flexGrow: 1,
        marginLeft: 20,
        width: 150
    }
});

const TopBar = ({classes, title, children}) => (
    <AppBar className={classes.root} position="sticky">
        <Toolbar>
            <img src="/public/images/logo_white.png" alt="Fairspace" height="60" />
            <Typography
                className={classes.title}
                variant="h6"
                noWrap
                component="a"
                href="/"
                sx={{
                    mr: 2,
                    display: {xs: 'none', md: 'flex'},
                    fontFamily: ['monospace'],
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                }}
            >
                {title} {process.env.NODE_ENV === 'development' ? "### LOCAL DEVELOPMENT ### " : ""}
            </Typography>
            {children}
            <UserMenu />
        </Toolbar>
    </AppBar>
);

export default withRouter(withStyles(styles)(TopBar));
