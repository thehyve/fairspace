import React, {useEffect, useState} from 'react';
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import {MuiThemeProvider} from '@material-ui/core/styles';
import DateFnsUtils from "@date-io/date-fns";
import {MuiPickersUtilsProvider} from "material-ui-pickers";
import useIsMounted from "react-is-mounted-hook";

import configureStore from "./common/redux/store/configureStore";
import Config from "./common/services/Config/Config";
import theme from './App.theme';
import Layout from "./common/components/Layout/Layout";
import {ErrorDialog, LoadingInlay} from './common/components';
import {UserProvider} from './common/contexts/UserContext';
import {VersionProvider} from './common/contexts/VersionContext';

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
        <VersionProvider>
            <UserProvider>
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
