import React, {useEffect, useState} from 'react';
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import {MuiThemeProvider} from '@material-ui/core/styles';
import DateFnsUtils from "@date-io/date-fns";
import {MuiPickersUtilsProvider} from "material-ui-pickers";
import useIsMounted from "react-is-mounted-hook";
import {
    ErrorDialog, Footer, Layout, LoadingInlay, LogoutContextProvider, UserProvider, UsersProvider, VersionProvider
} from '@fairspace/shared-frontend';

import configureStore from "./common/redux/store/configureStore";
import Config from "./common/services/Config";
import theme from './App.theme';
import Menu from "./common/components/Menu";
import Routes from "./routes/Routes";
import WorkspaceTopBar from "./common/components/WorkspaceTopBar";
import {ClipboardProvider} from "./common/contexts/ClipboardContext";
import {UploadsProvider} from "./common/contexts/UploadsContext";

const App = () => {
    const isMounted = useIsMounted();
    const [configLoaded, setConfigLoaded] = useState(false);

    useEffect(() => {
        Config.init()
            .then(() => isMounted() && setConfigLoaded(true));
    }, [isMounted]);

    if (!configLoaded) {
        return <LoadingInlay />;
    }

    // Initialize the store after configuration has loaded
    const store = configureStore();

    const {version: versionUrl, users, userInfo, logout, jupyterhub} = Config.get().urls;
    const requiredRole = Config.get().roles.user;

    return (
        <VersionProvider url={versionUrl}>
            <UserProvider url={userInfo}>
                <LogoutContextProvider
                    logoutUrl={logout}
                    jupyterhubUrl={jupyterhub}
                >
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <MuiThemeProvider theme={theme}>
                            <ClipboardProvider>
                                <UploadsProvider>
                                    <Provider store={store}>
                                        <ErrorDialog>
                                            <Router>
                                                <Layout
                                                    requiredAuthorization={requiredRole}
                                                    renderMenu={() => <Menu />}
                                                    renderMain={() => (
                                                        <UsersProvider url={users}>
                                                            <Routes />
                                                        </UsersProvider>
                                                    )}
                                                    renderTopbar={({name}) => <WorkspaceTopBar name={name} />}
                                                    renderFooter={({id, version}) => <Footer name={id} version={version} />}
                                                />
                                            </Router>
                                        </ErrorDialog>
                                    </Provider>
                                </UploadsProvider>
                            </ClipboardProvider>
                        </MuiThemeProvider>
                    </MuiPickersUtilsProvider>
                </LogoutContextProvider>
            </UserProvider>
        </VersionProvider>
    );
};

export default App;
