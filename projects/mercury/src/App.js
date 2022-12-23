import React from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import ErrorDialog from './common/components/ErrorDialog';

import theme from './App.theme';
import {UploadsProvider} from "./file/UploadsContext";
import {ClipboardProvider} from './common/contexts/ClipboardContext';
import GlobalRoutes from './routes/GlobalRoutes';
import {LogoutContextProvider} from "./users/LogoutContext";
import {UserProvider} from "./users/UserContext";

const App = () => (
    <LogoutContextProvider>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
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
                </ThemeProvider>
            </StyledEngineProvider>
        </MuiPickersUtilsProvider>
    </LogoutContextProvider>
);

export default App;
