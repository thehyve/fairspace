import React, {useEffect, useState} from 'react';
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import {MuiThemeProvider} from '@material-ui/core/styles';
import DateFnsUtils from "@date-io/date-fns";
import {MuiPickersUtilsProvider} from "material-ui-pickers";

import configureStore from "../store/configureStore";
import Config from "../services/Config/Config";
import theme from './App.theme';
import Layout from "./common/Layout/Layout";
import {ErrorDialog, LoadingInlay} from './common';
import {UserProvider} from '../UserContext';
import {UsersProvider} from "./permissions/UsersContext";
import useIsMounted from "../utils/useIsMounted";
import {WorkspaceProvider} from '../WorkspaceContext';

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

    return (
        <WorkspaceProvider>
            <UserProvider>
                <UsersProvider>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <MuiThemeProvider theme={theme}>
                            <Provider store={store}>
                                <ErrorDialog>
                                    <Router>
                                        <Layout />
                                    </Router>
                                </ErrorDialog>
                            </Provider>
                        </MuiThemeProvider>
                    </MuiPickersUtilsProvider>
                </UsersProvider>
            </UserProvider>
        </WorkspaceProvider>
    );
};

export default App;
