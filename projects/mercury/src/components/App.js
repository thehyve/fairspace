import React from 'react';
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import {MuiThemeProvider} from '@material-ui/core/styles';
import DateFnsUtils from "@date-io/date-fns";
import {MuiPickersUtilsProvider} from "material-ui-pickers";
import {fetchWorkspace} from "../actions/workspaceActions";
import configureStore from "../store/configureStore";
import Config from "../services/Config/Config";
import theme from './App.theme';
import Layout from "./common/Layout/Layout";
import {ErrorDialog, LoadingInlay} from './common';
import {UserProvider} from '../UserContext';
import {UsersProvider} from "./permissions/UsersContext";

class App extends React.Component {
    cancellable = {
        // it's important that this is one level down, so we can drop the
        // reference to the entire object by setting it to undefined.
        setState: this.setState.bind(this)
    };

    constructor(props) {
        super(props);
        this.state = {
            configLoaded: false
        };
    }

    componentDidMount() {
        this.store = configureStore();

        Config.init()
            .then(() => {
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
            return (
                <UserProvider>
                    <UsersProvider>
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
                    </UsersProvider>
                </UserProvider>
            );
        }
        return <LoadingInlay />;
    }
}

export default App;
