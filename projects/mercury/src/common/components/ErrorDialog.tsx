import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Slide,
    Typography,
} from '@mui/material';
import {Error as ErrorIcon} from '@mui/icons-material';
import DialogContentText from "@mui/material/DialogContentText";

const Transition = React.forwardRef(
    (props, ref) => <Slide ref={ref} direction="up" {...props} />
);

class ErrorDialog extends React.Component {
    static instance;

    constructor(props) {
        super(props);
        this.state = {
            title: null,
            message: null,
            onRetry: null,
            onDismiss: null
        };
        ErrorDialog.instance = this;
    }

    static showError(title, details, onRetry, onDismiss) {
        if (ErrorDialog.instance) {
            const message = (details instanceof Error) ? details.message : details;

            ErrorDialog.instance.setState({
                title,
                message,
                onRetry,
                onDismiss,
            });
        }
    }

    componentDidCatch(error) {
        console.error(error);
        ErrorDialog.showError('An error has occurred', error);
    }

    resetState = () => {
        this.setState({
            title: null,
            message: null,
            onRetry: null,
            onDismiss: null
        });
    };

    handleClose = () => {
        const dismiss = this.state.onDismiss;
        this.resetState();
        if (dismiss) {
            dismiss();
        }
    };

    handleRetry = () => {
        const retry = this.state.onRetry;
        this.resetState();
        retry();
    };

    render() {
        const {title, message, onRetry, maxWidth} = this.state;

        const dialog = (
            <Dialog
                open={Boolean(title)}
                TransitionComponent={Transition}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
                key="error-dialog"
                maxWidth={maxWidth || 'sm'}
                fullWidth={maxWidth === 'md'}
            >
                <DialogTitle id="alert-dialog-slide-title">
                    <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                            <ErrorIcon color="error" style={{fontSize: 40}} />
                        </Grid>
                        <Grid item>
                            <Typography variant="h6" gutterBottom>
                                {title}
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    {(typeof message) === 'string'
                        ? (
                            <DialogContentText component="div">
                                <Typography component="pre">{message}</Typography>
                            </DialogContentText>
                        )
                        : message}
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
                        ) : null}
                </DialogActions>
            </Dialog>
        );

        return [this.props.children, dialog];
    }
}

export default ErrorDialog;
