import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import {MuiThemeProvider} from '@material-ui/core/styles';
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import useIsMounted from "react-is-mounted-hook";
import {
    ErrorDialog,
    Footer,
    Layout,
    LoadingInlay,
    LogoutContextProvider,
    UserProvider,
    UsersProvider,
    VersionProvider
} from './common';

import Config from "./common/services/Config";
import theme from './App.theme';
import Menu from "./common/components/Menu";
import Routes from "./routes/Routes";
import WorkspaceTopBar from "./common/components/WorkspaceTopBar";
import {UploadsProvider} from "./common/contexts/UploadsContext";
import {CollectionsProvider} from "./common/contexts/CollectionsContext";
import {ClipboardProvider} from './common/contexts/ClipboardContext';
import {VocabularyProvider} from './metadata/VocabularyContext';

const App = () => {
    const userInfo = '/api/v1/account';
    const logout = '/logout';
    const versionUrl = '/config/version.json';
    const usersUrl = 'users/';

    const isMounted = useIsMounted();
    const [configLoaded, setConfigLoaded] = useState(false);

    useEffect(() => {
        Config.init()
            .then(() => isMounted() && setConfigLoaded(true));
    }, [isMounted]);

    if (!configLoaded) {
        return <LoadingInlay />;
    }


    const {jupyterhub} = Config.get().urls;
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
                            <UploadsProvider>
                                <ClipboardProvider>
                                    <CollectionsProvider>
                                        <ErrorDialog>
                                            <VocabularyProvider>
                                                <Router>
                                                    <Layout
                                                        requiredAuthorization={requiredRole}
                                                        renderMenu={() => <Menu />}
                                                        renderMain={() => (
                                                            <UsersProvider url={usersUrl}>
                                                                <Routes />
                                                            </UsersProvider>
                                                        )}
                                                        renderTopbar={({name}) => <WorkspaceTopBar name={name} />}
                                                        renderFooter={({id, version}) => <Footer name={id} version={version} />}
                                                    />
                                                </Router>
                                            </VocabularyProvider>
                                        </ErrorDialog>
                                    </CollectionsProvider>
                                </ClipboardProvider>
                            </UploadsProvider>
                        </MuiThemeProvider>
                    </MuiPickersUtilsProvider>
                </LogoutContextProvider>
            </UserProvider>
        </VersionProvider>
    );
};

export default App;
