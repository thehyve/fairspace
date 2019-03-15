import React from 'react';
import {
    Button, Dialog, DialogActions,
    DialogContent, DialogContentText,
    DialogTitle, Slide, Icon, Grid, Typography
} from '@material-ui/core';

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class ErrorDialog extends React.Component {
    static instance;

    constructor(props) {
        super(props);
        this.state = {
            error: false,
            message: null
        };
        ErrorDialog.instance = this;
    }

    static showError(error, message, onRetry, printToConsole = true) {
        if (printToConsole) {
            console.error(message, error);
        }
        if (ErrorDialog.instance) {
            ErrorDialog.instance.setState({error: true, stackTrace: error, message, onRetry});
        }
    }

    componentDidCatch(error) {
        ErrorDialog.showError(error, error.message);
    }

    handleClose = () => {
        this.setState({error: false, onRetry: null});
    };

    handleRetry = () => {
        const retry = this.state.onRetry;
        this.setState({error: false, onRetry: null});
        retry();
    };

    render() {
        const {error, message, onRetry} = this.state;

        const dialog = (
            <Dialog
                open={error}
                TransitionComponent={Transition}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
                key="error-dialog"
            >
                <DialogTitle id="alert-dialog-slide-title">
                    <Grid container alignItems="center" spacing={8}>
                        <Grid item>
                            <Icon color="error" style={{fontSize: 40}}>error</Icon>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6" gutterBottom>
                                An error has occurred
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {message}
                    </DialogContentText>
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
