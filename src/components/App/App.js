import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import styles from './App.styles';
import TopBar from "../layout/TopBar/TopBar";
import Footer from '../layout/Footer/Footer';
import MenuDrawer from "../layout/MenuDrawer/MenuDrawer";
import AuthorizationCheck from "../generic/AuthorizationCheck/AuthorizationCheck";
import Config from "../generic/Config/Config";

import {BrowserRouter as Router, Route} from "react-router-dom";
import Home from "../../pages/Home/Home";
import Collections from "../../pages/Collections/Collections";
import Notebooks from "../../pages/Notebooks/Notebooks";
import MetadataEntityPage from "../../pages/Metadata/MetadataEntityPage";
import MetadataOverviewPage from "../../pages/Metadata/MetadataOverviewPage";
import ErrorDialog from "../error/ErrorDialog";
import {fetchAuthorizations, fetchUser} from "../../actions/account";
import {fetchWorkspace} from "../../actions/workspace";
import store from "../../store/configureStore";
import {Provider} from "react-redux";
import Files from "../../pages/Files/Files";
import {logout} from "./logout";

// theme
import {MuiThemeProvider, createMuiTheme, withTheme} from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';
import indigo from '@material-ui/core/colors/indigo';

const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: pink
    }
});

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
        // Wait for the configuration to be loaded
        Config.init()
            .then(() => {
                store.dispatch(fetchUser());
                store.dispatch(fetchAuthorizations());
                store.dispatch(fetchWorkspace());
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
            // The app itself consists of a topbar, a drawer and the actual page
            // The topbar is shown even if the user has no proper authorization
            return (
                <MuiThemeProvider theme={theme}>
                    <div className={classes.root}>
                        <Provider store={store}>
                            <ErrorDialog>
                                <TopBar classes={classes}></TopBar>
                                <Router>
                                    <AuthorizationCheck transformError={this.transformError.bind(this)}>
                                        <MenuDrawer classes={classes}></MenuDrawer>
                                        <main className={classes.content}>
                                            <div className={classes.toolbar}/>

                                            <Route exact path="/" component={Home}/>
                                            <Route exact path="/collections" component={Collections}/>
                                            <Route path="/collections/:collection/:path(.*)?" component={Files}/>
                                            <Route path="/notebooks" component={Notebooks}/>

                                            <Route exact path="/metadata" component={MetadataOverviewPage}/>
                                            <Route path="/metadata/:type(projects|patients|samples|consents)/:id"
                                                   component={MetadataEntityPage}/>

                                            {/* Handle auth urls that should go to the server */}
                                            <Route path="/login" render={() => {
                                                window.location.href = '/login';
                                            }}/>
                                            <Route path="/logout" render={logout}/>
                                        </main>
                                    </AuthorizationCheck>
                                </Router>
                                <Footer></Footer>
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

export default withTheme()(withStyles(styles)(App));
