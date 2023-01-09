import React from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import ErrorDialog from './common/components/ErrorDialog';
import {ThemeProvider, StyledEngineProvider} from '@mui/material/styles';
import theme from './App.theme';
import {UploadsProvider} from "./file/UploadsContext";
import {ClipboardProvider} from './common/contexts/ClipboardContext';
import GlobalRoutes from './routes/GlobalRoutes';
import {LogoutContextProvider} from "./users/LogoutContext";
import {UserProvider} from "./users/UserContext";

const App = () => (
    <ThemeProvider theme={theme}>
        <LogoutContextProvider>
            <StyledEngineProvider injectFirst>
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
            </StyledEngineProvider>
        </LogoutContextProvider>
    </ThemeProvider>
);

export default App;
