import React, {useState} from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import withStyles from '@mui/styles/withStyles';
import TextField from "@mui/material/TextField";
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

    const isCodeLengthWarning = () => (!!value && value.trim().length > 10);
    const isWorkspaceCodeUnique = (workspaceName) => !workspaces.some(workspace => workspace.code === workspaceName);
    const isCodeValid = () => value === null || (!!value && !!value.trim() && isWorkspaceCodeUnique(value.trim()));

    const onDialogSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (value && isCodeValid()) {
            onSubmit({code: value.trim()});
        }
    };

    const renderCodeHelperText = () => (
        <span>
            Workspace code. Has to be unique.
            <span className={!isCodeLengthWarning() ? classes.textHelperBasic : classes.textHelperWarning}>
                <br />
                {isCodeLengthWarning() && (
                    <span><b>Warning!</b> Code is longer than 10 characters!<br /></span>
                )}
                The code will prefix all collections of the workspace - preferred length is maximum 10 characters
                <br />
            </span>
        </span>
    );

    return <>
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
                    id="code"
                    label="Code"
                    data-testid="Code"
                    helperText={renderCodeHelperText()}
                    value={value}
                    name="code"
                    onChange={(event) => setValue(event.target.value)}
                    fullWidth
                    required
                    error={!isCodeValid()}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    type="submit"
                    form="formId"
                    data-testid="submit-button"
                    disabled={value === null || !isCodeValid()}
                    color="primary"
                    variant="contained"
                    onClick={onDialogSubmit}
                >
                    Save
                </Button>
                <Button onClick={onClose} aria-label="Cancel">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
        <LoadingOverlay loading={creating} />
    </>;
};

export default (withStyles(styles))(WorkspaceDialog);
