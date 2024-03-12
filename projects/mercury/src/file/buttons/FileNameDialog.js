import React from 'react';

import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import ControlledTextField from '../../common/components/ControlledTextField';

export default ({onClose, onSubmit, submitDisabled, title, control}) => (
    <Dialog
        open
        onClose={onClose}
        aria-labelledby="form-dialog-title"
    >
        <DialogTitle id="form-dialog-title">{title}</DialogTitle>
        <DialogContent>
            <form data-testid="form" id="formId" noValidate onSubmit={onSubmit}>
                <ControlledTextField
                    key="id"
                    id="id"
                    margin="dense"
                    name="name"
                    label="Name"
                    autoFocus
                    required
                    fullWidth
                    control={control}
                    helperText="Value cannot equal '.' or '..' and cannot contain '/' or '\'."
                    inputProps={{
                        'data-testid': 'Name',
                        'aria-label': 'Name',
                    }}
                />
            </form>
        </DialogContent>
        <DialogActions>
            <Button
                type="submit"
                form="formId"
                data-testid="submit-button"
                color="primary"
                disabled={submitDisabled}
            >
                Submit
            </Button>
            <Button onClick={onClose}>
                Cancel
            </Button>
        </DialogActions>
    </Dialog>
);
