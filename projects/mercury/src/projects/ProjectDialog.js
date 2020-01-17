import React from "react";

import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@material-ui/core";
import ControlledTextField from "../common/components/ControlledTextField";


const ControlledTextFieldWrapper = ({
    control, type, autoFocus = false, required = false, id, label, name, disabled,
    multiline = false, select = false, selectOptions = [], helperText, inputProps
}) => (
    <ControlledTextField
        key={id}
        fullWidth
        margin="dense"
        autoFocus={autoFocus}
        control={control}
        selectOptions={selectOptions}
        type={type}
        disabled={disabled}
        id={id}
        label={label}
        name={name}
        multiline={multiline}
        select={select}
        required={required}
        helperText={helperText}
        inputProps={{
            'data-testid': label,
            'aria-label': label,
            ...inputProps
        }}
    />
);

export default ({onSubmit, onClose, submitDisabled, fields}) => (
    <Dialog
        open
        onClose={onClose}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth="sm"
    >
        <DialogTitle id="form-dialog-title">
            <div>
                <Typography variant="h5" component="h2">New project</Typography>
            </div>
        </DialogTitle>
        <DialogContent style={{overflowX: 'hidden'}}>
            <form data-testid="form" id="formId" noValidate onSubmit={onSubmit}>
                {fields.map(ControlledTextFieldWrapper)}
            </form>
        </DialogContent>
        <DialogActions>
            <Button
                type="submit"
                form="formId"
                data-testid="submit-button"
                disabled={submitDisabled}
                color="primary"
                variant="contained"
            >
                    Save
            </Button>
            <Button onClick={onClose} aria-label="Cancel" color="default">
                Cancel
            </Button>
        </DialogActions>
    </Dialog>
);
