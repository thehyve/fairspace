import React from 'react';
import PropTypes from 'prop-types';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';

const confirmationDialog = ({
    title = 'Confirmation',
    content = '',
    agreeButtonText = 'Submit',
    disagreeButtonText = 'Cancel',
    open = false,
    onClose = () => {},
    onAgree = () => {},
    onDisagree = () => {}
}) => (
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
                {disagreeButtonText}
            </Button>
            <Button
                onClick={onAgree}
                color="primary"
                autoFocus
            >
                {agreeButtonText}
            </Button>
        </DialogActions>
    </Dialog>
);

confirmationDialog.propTypes = {
    open: PropTypes.bool,
    title: PropTypes.string,
    content: PropTypes.string,
    agreeButtonText: PropTypes.string,
    disagreeButtonText: PropTypes.string,
    onClose: PropTypes.func,
    onAgree: PropTypes.func,
    onDisagree: PropTypes.func,
};

export default confirmationDialog;
