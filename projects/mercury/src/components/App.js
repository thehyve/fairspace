import React from 'react';
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import {MuiThemeProvider} from '@material-ui/core/styles';
import DateFnsUtils from "@date-io/date-fns";
import {MuiPickersUtilsProvider} from "material-ui-pickers";

import {fetchAuthorizations} from "../actions/accountActions";
import {fetchUsers, fetchWorkspace} from "../actions/workspaceActions";
import configureStore from "../store/configureStore";
import Config from "../services/Config/Config";
import theme from './App.theme';
import Layout from "./common/Layout/Layout";
import {LoadingInlay, ErrorDialog} from './common';
import {UserContext} from '../UserContext';
import AccountAPI from '../services/AccountAPI';

class App extends React.Component {
    cancellable = {
        // it's important that this is one level down, so we can drop the
        // reference to the entire object by setting it to undefined.
        setState: this.setState.bind(this)
    };

    constructor(props) {
        super(props);
        this.state = {
            configLoaded: false,
            currentUserLoading: false,
            currentUserError: null,
            currentUser: {}
        };
    }

    componentDidMount() {
        this.store = configureStore();

        Config.init()
            .then(() => {
                this.setState({currentUserLoading: true});
                AccountAPI.getUser()
                    .then(currentUser => this.setState({
                        currentUser,
                        currentUserError: false
                    }))
                    .catch(e => this.setState({currentUserError: e}))
                    .finally(() => {
                        this.setState({currentUserLoading: false});
                    });

                this.store.dispatch(fetchUsers());
                this.store.dispatch(fetchAuthorizations());
                this.store.dispatch(fetchWorkspace());

                if (this.cancellable.setState) {
                    this.cancellable.setState({configLoaded: true});
                }
            });
    }

    componentWillUnmount() {
        this.cancellable.setState = undefined;
    }

    render() {
        if (this.state.configLoaded) {
            const {currentUser, currentUserLoading, currentUserError} = this.state;

            return (
                <UserContext.Provider value={{currentUser, currentUserLoading, currentUserError}}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <MuiThemeProvider theme={theme}>
                            <Provider store={this.store}>
                                <ErrorDialog>
                                    <Router>
                                        <Layout />
                                    </Router>
                                </ErrorDialog>
                            </Provider>
                        </MuiThemeProvider>
                    </MuiPickersUtilsProvider>
                </UserContext.Provider>
            );
        }
        return <LoadingInlay />;
    }
}

export default App;
