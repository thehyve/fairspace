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
        selectOptions = {selectOptions}
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
            'aria-label': label,
            ...inputProps
        }}
    />
);

export default ({onSubmit, onClose, submitDisabled, fields}) => {
    return (
        <Dialog
            open
            onClose={onClose}
            aria-labelledby="form-dialog-title"
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle id="form-dialog-title">
                <Typography variant="h5">New project</Typography>
            </DialogTitle>
            <DialogContent style={{overflowX: 'hidden'}}>
                <form data-testid="form" id="formId" noValidate onSubmit={onSubmit}>
                    {fields.map(ControlledTextFieldWrapper)}
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} aria-label="Cancel" color="secondary">
                    Cancel
                </Button>
                <Button type="submit" form="formId" disabled={submitDisabled} color="primary" variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );

}
