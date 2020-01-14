import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import {MuiThemeProvider} from '@material-ui/core/styles';
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import useIsMounted from "react-is-mounted-hook";
import {
    ErrorDialog,
    LoadingInlay,
    LogoutContextProvider,
    UserProvider,
    VersionProvider
} from './common';

import Config from "./common/services/Config";
import theme from './App.theme';
import {UploadsProvider} from "./common/contexts/UploadsContext";
import {ClipboardProvider} from './common/contexts/ClipboardContext';
import GlobalRoutes from './routes/GlobalRoutes';

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


    return (
        <VersionProvider>
            <UserProvider>
                <LogoutContextProvider>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <MuiThemeProvider theme={theme}>
                            <UploadsProvider>
                                <ClipboardProvider>
                                    <ErrorDialog>
                                        <Router>
                                            <GlobalRoutes />
                                        </Router>
                                    </ErrorDialog>
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
