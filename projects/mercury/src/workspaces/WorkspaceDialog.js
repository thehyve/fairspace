import React, {useState} from "react";

import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, withStyles} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import LoadingOverlay from "../common/components/LoadingOverlay";

const styles = theme => ({
    textHelperBasic: {
        color: theme.palette.grey['600'],
    },
    textHelperWarning: {
        color: theme.palette.warning.dark,
    }
});

const WorkspaceDialog = ({onSubmit, onClose, creating, workspaces, classes = {}}) => {
    const [value, setValue] = useState(null);

    const isNameLengthWarning = () => (!!value && value.trim().length > 10);
    const isWorkspaceNameUnique = (workspaceName) => !workspaces.some(workspace => workspace.name === workspaceName);
    const isNameValid = () => value === null || (!!value && !!value.trim() && isWorkspaceNameUnique(value.trim()));

    const onDialogSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (value && isNameValid()) {
            onSubmit({name: value.trim()});
        }
    };

    const renderNameHelperText = () => (
        <span>
            Workspace code. Has to be unique.
            <span className={!isNameLengthWarning() ? classes.textHelperBasic : classes.textHelperWarning}>
                <br />
                {isNameLengthWarning() && (
                    <span><b>Warning!</b> Code is longer than 10 characters!<br /></span>
                )}
                The code will prefix all collections of the workspace - preferred length is maximum 10 characters
                <br />
            </span>
        </span>
    );

    return (
        <>
            <Dialog
                open={!creating}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle id="form-dialog-title">
                    <div>
                        <Typography variant="h5" component="h2">Create workspace</Typography>
                    </div>
                </DialogTitle>
                <DialogContent style={{overflowX: 'hidden'}}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Code"
                        data-testid="Code"
                        helperText={renderNameHelperText()}
                        value={value}
                        name="name"
                        onChange={(event) => setValue(event.target.value)}
                        fullWidth
                        required
                        error={!isNameValid()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        form="formId"
                        data-testid="submit-button"
                        disabled={value === null || !isNameValid()}
                        color="primary"
                        variant="contained"
                        onClick={onDialogSubmit}
                    >
                        Save
                    </Button>
                    <Button onClick={onClose} aria-label="Cancel" color="default">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            <LoadingOverlay loading={creating} />
        </>
    );
};

export default (withStyles(styles))(WorkspaceDialog);
