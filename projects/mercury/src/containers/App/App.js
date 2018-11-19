import React from 'react';
import PropTypes from 'prop-types';
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import {fetchAuthorizations, fetchUser} from "../../actions/account";
import {fetchUsers, fetchWorkspace} from "../../actions/workspace";
import ErrorDialog from "../../components/error/ErrorDialog";
import configureStore from "../../store/configureStore";
import Config from "../../services/Config/Config";

// theme
import {MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import styles from './App.styles';
import theme from './App.theme';
import Layout from "../Layout/Layout";

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
                this.cancellable.setState && this.cancellable.setState({configLoaded: true});
            });
    }

    componentWillUnmount() {
        this.cancellable.setState = undefined;
    }

    // If an error is to be shown, it should be underneath the
    // AppBar. This method take care of it
    transformError(errorContent) {
        return (<main className={this.props.classes.content}>
            <div className={this.props.classes.toolbar}/>
            {errorContent}
        </main>)
    }

    render() {
        if (this.state.configLoaded) {
            const classes = this.props.classes;

            return (
                <MuiThemeProvider theme={theme}>
                    <div className={classes.root}>
                        <Provider store={this.store}>
                            <ErrorDialog>
                                <Router>
                                    <Layout />
                                </Router>
                            </ErrorDialog>
                        </Provider>
                    </div>
                </MuiThemeProvider>
            );
        } else {
            return (<div>Loading...</div>);
        }
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
