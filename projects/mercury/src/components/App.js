import React from 'react';
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import {MuiThemeProvider} from '@material-ui/core/styles';
import {fetchAuthorizations, fetchUser} from "../actions/account";
import {fetchUsers, fetchWorkspace} from "../actions/workspace";
import configureStore from "../store/configureStore";
import Config from "../services/Config/Config";
import theme from './App.theme';
import Layout from "./common/layout/Layout";
import LoadingInlay from './common/LoadingInlay';
import ErrorDialog from "./common/ErrorDialog";

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
        // Setup store
        this.store = configureStore();

        // Wait for the configuration to be loaded
        Config.init()
            .then(() => {
                this.store.dispatch(fetchUser());
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
            return (
                <MuiThemeProvider theme={theme}>
                    <Provider store={this.store}>
                        <ErrorDialog>
                            <Router>
                                <Layout />
                            </Router>
                        </ErrorDialog>
                    </Provider>
                </MuiThemeProvider>
            );
        }
        return <LoadingInlay />;
    }
}

export default App;
