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
const DEFAULT_MAX_WIDTH = 'sm';

class ErrorDialog extends React.Component {
    static instance;

    constructor(props) {
        super(props);
        this.state = {
            showDialog: false,
            errorAsComponent: DialogContentText,
            errorAsComponentProps: null,
            title: DEFAULT_ERROR_TITLE,
            onRetry: null
        };
        ErrorDialog.instance = this;
    }

    static showError(error, message, onRetry, printToConsole = true) {
        if (printToConsole) {
            console.error(message, error);
        }

        ErrorDialog.renderError(DialogContentText, {children: message}, DEFAULT_ERROR_TITLE, DEFAULT_MAX_WIDTH, onRetry);
    }

    static renderError(component, props, title = DEFAULT_ERROR_TITLE, maxWidth, onRetry) {
        if (ErrorDialog.instance) {
            ErrorDialog.instance.setState({
                showDialog: true,
                errorAsComponent: component,
                errorAsComponentProps: props,
                title,
                maxWidth: maxWidth || 'md',
                onRetry,
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
        const {showDialog, title, errorAsComponent: ErrorComponent, errorAsComponentProps, onRetry, maxWidth} = this.state;

        const dialog = (
            <Dialog
                open={showDialog}
                TransitionComponent={Transition}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
                key="error-dialog"
                maxWidth={maxWidth || 'sm'}
                fullWidth={maxWidth === 'md'}
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
                    <ErrorComponent {...errorAsComponentProps} />
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
