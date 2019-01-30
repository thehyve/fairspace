import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';

const confirmationDialog = ({title, content, open, onClose, onAgree, onDisagree}) => (
    <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="alert-dialog-title">
            {title}
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {content}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button
                onClick={onDisagree}
                color="primary"
            >
                Cancel
            </Button>
            <Button
                onClick={onAgree}
                color="primary"
                autoFocus
            >
                Submit
            </Button>
        </DialogActions>
    </Dialog>
);

confirmationDialog.propTypes = {
    open: PropTypes.bool,
    title: PropTypes.string,
    content: PropTypes.string,
    onClose: PropTypes.func,
    onAgree: PropTypes.func,
    onDisagree: PropTypes.func,
};

confirmationDialog.defaultProps = {
    open: false,
    title: '',
    content: '',
    onClose: () => {},
    onAgree: () => {},
    onDisagree: () => {},
};

export default confirmationDialog;
