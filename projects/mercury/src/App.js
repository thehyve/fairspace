import React, {useEffect, useState} from 'react';
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import {MuiThemeProvider} from '@material-ui/core/styles';
import DateFnsUtils from "@date-io/date-fns";
import {MuiPickersUtilsProvider} from "material-ui-pickers";
import useIsMounted from "react-is-mounted-hook";
import {LoadingInlay, UserProvider, VersionProvider} from '@fairspace/shared-frontend';

import configureStore from "./common/redux/store/configureStore";
import Config from "./common/services/Config/Config";
import theme from './App.theme';
import Layout from "./common/components/Layout/Layout";
import {ErrorDialog} from './common/components';

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
        <VersionProvider url={Config.get().urls.version}>
            <UserProvider url={Config.get().urls.userInfo}>
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
            </UserProvider>
        </VersionProvider>
    );
};

export default App;
