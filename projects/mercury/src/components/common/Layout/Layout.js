import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import styles from './Layout.styles';
import TopBar from "./TopBar/TopBar";
import Footer from './Footer/Footer';
import AuthorizationCheck from '../AuthorizationCheck';
import MenuDrawer from "./MenuDrawer/MenuDrawer";
import Routes from "../../Routes";

const Layout = ({classes}) => {
    // If an error is to be shown, it should be underneath the
    // AppBar. This method take care of it
    const transformError = errorContent => (
        <main className={classes.content}>
            <div className={classes.toolbar} />
            {errorContent}
        </main>
    );

    // The app itself consists of a topbar, a drawer and the actual page
    // The topbar is shown even if the user has no proper authorization
    return (
        <>
            <TopBar classes={classes} />
            <AuthorizationCheck transformError={transformError}>
                <MenuDrawer />
                <main style={{overflow: 'scroll', height: '100vh'}} className={classes.main}>
                    <Routes />
                </main>
            </AuthorizationCheck>
            <Footer />
        </>
    );
};

export default withStyles(styles)(Layout);
