import React, {useContext, useState} from 'react';
import PropTypes from "prop-types";
import {withStyles} from '@material-ui/core/styles';
import Link from "@material-ui/core/Link";
import styles from './Layout.styles';
import Footer from './Footer';
import TopBar from "./TopBar";
import MenuDrawer from "./MenuDrawer";
import LoadingInlay from "../common/components/LoadingInlay";
import versionInfo from '../common/VersionInfo';
import UserContext from "../users/UserContext";
import StatusContext, {VALID_USER_SESSION} from "../status/StatusContext";
import {SERVER_STATUS_UP} from "../status/StatusAPI";
import StatusAlert from "../status/StatusAlert";

const LOCAL_STORAGE_MENU_KEY = 'FAIRSPACE_MENU_EXPANDED';
const LEFT_MENU_EXPANSION_DELAY = 500;

const Layout = ({
    classes,
    renderMenu,
    renderMain = () => {},
    renderTopbar = () => <TopBar title={versionInfo.name} />
}) => {
    const [menuExpanded, setMenuExpanded] = useState(window.localStorage.getItem(LOCAL_STORAGE_MENU_KEY) !== 'false');
    const [menuOpenDueToHover, setMenuOpenDueToHover] = useState(false);
    const [timeoutId, setTimeoutId] = useState();
    const {currentUserLoading} = useContext(UserContext);
    const {serverStatus, userSessionStatus} = useContext(StatusContext);

    if (currentUserLoading) {
        return <LoadingInlay />;
    }

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

    const renderAlert = () => {
        if (serverStatus !== SERVER_STATUS_UP) {
            return <StatusAlert><strong>A server-side error occurred.</strong> Please try again later.</StatusAlert>;
        }
        if (userSessionStatus !== VALID_USER_SESSION) {
            return (
                <StatusAlert>
                    <strong>Current user session is no longer active.</strong>
                    Please <Link href="#" onClick={() => window.location.assign(`/logout`)}>log in</Link> again.
                </StatusAlert>
            );
        }
        return <></>;
    };

    // The topbar is shown even if the user has no proper authorization
    return (
        // The app itself consists of a topbar, a drawer and the actual page
        <>
            {renderTopbar()}
            {renderAlert()}
            {renderMenu && (
                <MenuDrawer
                    open={menuOpen}
                    renderMenu={renderMenu}
                    toggleMenuExpansion={toggleMenuExpansion}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={handleMouseEnter}
                />
            )}
            <main style={{marginLeft: menuExpanded ? 175 : 0}} className={classes.main}>
                {renderMain()}
            </main>
            <Footer content={`${versionInfo.name} ${versionInfo.version}`} />
        </>
    );
};

Layout.propTypes = {
    renderMenu: PropTypes.func,
    renderMain: PropTypes.func,
    renderTopbar: PropTypes.func
};

export default withStyles(styles)(Layout);
