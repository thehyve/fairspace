import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import styles from './Layout.styles';
import TopBar from "../../components/layout/TopBar/TopBar";
import Footer from '../../components/layout/Footer/Footer';
import MenuDrawer from "../../components/layout/MenuDrawer/MenuDrawer";
import AuthorizationCheck from "../AuthorizationCheck/AuthorizationCheck";
import Routes from "../Routes/Routes";

const Layout = ({classes}) => {
    // If an error is to be shown, it should be underneath the
    // AppBar. This method take care of it
    const transformError = (errorContent) => (
        <main className={classes.content}>
            <div className={classes.toolbar}/>
            {errorContent}
        </main>);

    // The app itself consists of a topbar, a drawer and the actual page
    // The topbar is shown even if the user has no proper authorization
    return (
        <React.Fragment>
            <TopBar classes={classes}/>
            <AuthorizationCheck transformError={transformError.bind(this)}>
                <Routes />
            </AuthorizationCheck>
            <Footer/>
        </React.Fragment>
    );
}

Layout.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Layout);
