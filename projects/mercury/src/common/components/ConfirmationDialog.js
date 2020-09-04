import React from 'react';
import PropTypes from 'prop-types';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';

const confirmationDialog = ({
    title = 'Confirmation',
    content = '',
    agreeButtonText = 'Submit',
    disagreeButtonText = 'Cancel',
    dangerous = false,
    open = false,
    onAgree = () => {},
    onDisagree = () => {},
}) => (
    <Dialog
        open={open}
        onClose={onDisagree}
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
                onClick={onAgree}
                color={dangerous ? 'secondary' : 'primary'}
                autoFocus={!dangerous}
            >
                {agreeButtonText}
            </Button>
            <Button
                onClick={onDisagree}
                color="default"
            >
                {disagreeButtonText}
            </Button>
        </DialogActions>
    </Dialog>
);

confirmationDialog.propTypes = {
    open: PropTypes.bool,
    title: PropTypes.string,
    content: PropTypes.any,
    agreeButtonText: PropTypes.string,
    disagreeButtonText: PropTypes.string,
    onAgree: PropTypes.func,
    onDisagree: PropTypes.func,
};

export default confirmationDialog;
