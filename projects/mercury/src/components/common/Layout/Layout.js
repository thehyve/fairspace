import React, {useState, useContext} from 'react';
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom';
import {withStyles} from '@material-ui/core/styles';

import styles from './Layout.styles';
import TopBar from "./TopBar/TopBar";
import Footer from './Footer/Footer';
import AuthorizationCheck from '../AuthorizationCheck';
import MenuDrawer from "./MenuDrawer/MenuDrawer";
import Routes from "../../Routes";
import Config from "../../../services/Config/Config";
import {isAuthorizationsPending} from "../../../reducers/account/authorizationsReducers";
import {isWorkspacePending} from "../../../reducers/workspaceReducers";
import {isRedirectingForLogin} from "../../../reducers/uiReducers";
import {LoadingInlay} from "../index";
import UserContext from '../../../UserContext';
import {LEFT_MENU_EXPANSION_DELAY, LOCAL_STORAGE_MENU_KEY} from "../../../constants";

const Layout = ({classes, workspaceName, version, pending}) => {
    const [menuExpanded, setMenuExpanded] = useState(window.localStorage.getItem(LOCAL_STORAGE_MENU_KEY) !== 'false');
    const [menuOpenDueToHover, setMenuOpenDueToHover] = useState(false);
    const [timeoutId, setTimeoutId] = useState();
    const {currentUserLoading} = useContext(UserContext);

    if (pending || currentUserLoading) {
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
            <TopBar workspaceName={workspaceName} />
            <AuthorizationCheck authorization={Config.get().roles.user} transformError={transformError}>
                <MenuDrawer open={menuOpen} toggleMenuExpansion={toggleMenuExpansion} onMouseLeave={handleMouseLeave} onMouseEnter={handleMouseEnter} />
                <main style={{marginLeft: menuExpanded ? 175 : 0}} className={classes.main}>
                    <Routes />
                </main>
            </AuthorizationCheck>
            <Footer workspaceName={workspaceName} version={version} />
        </>
    );
};


const mapStateToProps = state => {
    const {name, version} = {...state.workspace.data};

    return {
        pending: isAuthorizationsPending(state) || isWorkspacePending(state) || isRedirectingForLogin(state),
        menuExpanded: state.ui.menuExpanded,
        workspaceName: name,
        version
    };
};

export default withRouter(connect(mapStateToProps)(withStyles(styles)(Layout)));
