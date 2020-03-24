import React from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import {MuiThemeProvider} from '@material-ui/core/styles';
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import {ErrorDialog, LogoutContextProvider, UserProvider} from './common';

import theme from './App.theme';
import {UploadsProvider} from "./common/contexts/UploadsContext";
import {ClipboardProvider} from './common/contexts/ClipboardContext';
import GlobalRoutes from './routes/GlobalRoutes';

const App = () => (
    <LogoutContextProvider>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <MuiThemeProvider theme={theme}>
                <UserProvider>
                    <UploadsProvider>
                        <ClipboardProvider>
                            <ErrorDialog>
                                <Router>
                                    <GlobalRoutes />
                                </Router>
                            </ErrorDialog>
                        </ClipboardProvider>
                    </UploadsProvider>
                </UserProvider>
            </MuiThemeProvider>
        </MuiPickersUtilsProvider>
    </LogoutContextProvider>
);

export default App;
