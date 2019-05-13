import React from 'react';
import {
    Button, Dialog, DialogActions,
    DialogContent, DialogContentText,
    DialogTitle, Slide, Icon, Grid, Typography,
} from '@material-ui/core';

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

const DEFAULT_ERROR_TITLE = 'An error has occurred';

class ErrorDialog extends React.Component {
    static instance;

    constructor(props) {
        super(props);
        this.state = {
            showDialog: false,
            title: DEFAULT_ERROR_TITLE,
            message: null,
            onRetry: null,
            errorAsComponent: null,
            errorAsComponentProps: null
        };
        ErrorDialog.instance = this;
    }

    static showError(error, message, onRetry, printToConsole = true) {
        if (printToConsole) {
            console.error(message, error);
        }
        if (ErrorDialog.instance) {
            ErrorDialog.instance.setState({
                showDialog: true,
                title: DEFAULT_ERROR_TITLE,
                stackTrace: error,
                message,
                onRetry
            });
        }
    }

    static renderError(component, props, title = DEFAULT_ERROR_TITLE) {
        if (ErrorDialog.instance) {
            ErrorDialog.instance.setState({
                showDialog: true,
                title,
                message: null,
                errorAsComponent: component,
                errorAsComponentProps: props,
            });
        }
    }

    componentDidCatch(error) {
        ErrorDialog.showError(error, error.message);
    }

    resetState = () => {
        this.setState({
            showDialog: false,
            onRetry: null,
        });
    }

    handleClose = () => {
        this.resetState();
    };

    handleRetry = () => {
        const retry = this.state.onRetry;
        this.resetState();
        retry();
    };

    render() {
        const {showDialog, title, message, errorAsComponent: ErrorComponent, errorAsComponentProps, onRetry} = this.state;
        const hasErrorComponent = !!ErrorComponent;

        const dialog = (
            <Dialog
                open={showDialog}
                TransitionComponent={Transition}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
                key="error-dialog"
                maxWidth={hasErrorComponent ? 'md' : 'sm'}
                fullWidth={hasErrorComponent}
            >
                <DialogTitle id="alert-dialog-slide-title">
                    <Grid container alignItems="center" spacing={8}>
                        <Grid item>
                            <Icon color="error" style={{fontSize: 40}}>error</Icon>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6" gutterBottom>
                                {title || DEFAULT_ERROR_TITLE}
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    {hasErrorComponent ? <ErrorComponent {...errorAsComponentProps} /> : (
                        <DialogContentText id="alert-dialog-slide-description">
                            {message}
                        </DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.handleClose}
                        color="primary"
                    >
                        Dismiss
                    </Button>
                    {onRetry
                        ? (
                            <Button
                                onClick={this.handleRetry}
                                color="primary"
                            >
                                Retry
                            </Button>
                        ) : null
                    }
                </DialogActions>
            </Dialog>
        );

        return [this.props.children, dialog];
    }
}

export default ErrorDialog;
