import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';

class ConfirmationDialog extends React.Component {

    handleDisagree = (e) => {
        this.props.onDisagree(e);
    };

    handleAgree = (e) => {
        this.props.onAgree(e);
    };

    handleClose = (e) => {
        this.props.onClose(e);
    };

    render() {
        const {title, content, open} = this.props;
        return (
            <Dialog
                open={open}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleDisagree} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.handleAgree} color="primary" autoFocus>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConfirmationDialog.propTypes = {
    open: PropTypes.bool,
    title: PropTypes.string,
    content: PropTypes.string,
    onYes: PropTypes.func,
    onNo: PropTypes.func,
    onClose: PropTypes.func,
};

ConfirmationDialog.defaultProps = {
    open: false,
    title: '',
    content: '',
};

export default ConfirmationDialog;
