import React, {useContext, useState} from 'react';
import PropTypes from "prop-types";
import {withStyles} from '@material-ui/core/styles';

import styles from './Layout.styles';
import Footer from './Footer';
import TopBar from "./TopBar";
import AuthorizationCheck from '../AuthorizationCheck';
import MenuDrawer from "./MenuDrawer";
import {LEFT_MENU_EXPANSION_DELAY, LOCAL_STORAGE_MENU_KEY} from "../../constants";
import LoadingInlay from "../LoadingInlay";
import VersionContext from "../../contexts/VersionContext";
import UserContext from "../../contexts/UserContext";

const Layout = ({
    classes,
    requiredAuthorization,
    renderMenu = () => {},
    renderMain = () => {},
    renderTopbar = ({name}) => <TopBar name={name} />,
    renderFooter = ({name, version}) => <Footer name={name} version={version} />
}) => {
    const [menuExpanded, setMenuExpanded] = useState(window.localStorage.getItem(LOCAL_STORAGE_MENU_KEY) !== 'false');
    const [menuOpenDueToHover, setMenuOpenDueToHover] = useState(false);
    const [timeoutId, setTimeoutId] = useState();
    const {currentUserLoading} = useContext(UserContext);
    const {id, name, version, loading: versionLoading, redirecting} = useContext(VersionContext);

    if (redirecting || versionLoading || currentUserLoading) {
        return <LoadingInlay />;
    }

    // If an error is to be shown, it should be underneath the
    // AppBar. This method take care of it
    const transformError = errorContent => (
        <main className={classes.content}>
            <div className={classes.toolbar} />
            {errorContent}
        </main>
    );

    const menuOpen = menuExpanded || menuOpenDueToHover;
    const toggleMenuExpansion = () => {
        const newExpansionState = !menuExpanded;
        window.localStorage.setItem(LOCAL_STORAGE_MENU_KEY, newExpansionState);
        setMenuExpanded(newExpansionState);
    };

    // The left menu should only open after a short delay.
    // The timeout id for this is stored in state, as this component
    // could be rerendered when the user clicks a menu item. Storing it
    // in state makes sure that the timeout can still be cancelled when
    // the user leaves the menu
    const handleMouseEnter = () => {
        setTimeoutId(setTimeout(() => {
            setMenuOpenDueToHover(true);
            setTimeoutId();
        }, LEFT_MENU_EXPANSION_DELAY));
    };

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId();
        }
        setMenuOpenDueToHover(false);
    };

    // The app itself consists of a topbar, a drawer and the actual page
    // The topbar is shown even if the user has no proper authorization
    return (
        <>
            {renderTopbar({name})}
            <AuthorizationCheck requiredAuthorization={requiredAuthorization} transformError={transformError}>
                <MenuDrawer open={menuOpen} renderMenu={renderMenu} toggleMenuExpansion={toggleMenuExpansion} onMouseLeave={handleMouseLeave} onMouseEnter={handleMouseEnter} />
                <main style={{marginLeft: menuExpanded ? 175 : 0}} className={classes.main}>
                    {renderMain()}
                </main>
            </AuthorizationCheck>
            {renderFooter({id, name, version})}
        </>
    );
};

Layout.propTypes = {
    requiredAuthorization: PropTypes.string,
    renderMenu: PropTypes.func,
    renderMain: PropTypes.func,
    renderTopbar: PropTypes.func,
    renderFooter: PropTypes.func
};

export default withStyles(styles)(Layout);
