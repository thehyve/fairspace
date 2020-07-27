// @flow
import React, {useContext, useState} from 'react';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import {withStyles} from "@material-ui/core/styles";
import CollectionsContext from "./CollectionsContext";

export const styles = {
    root: {
        width: 400,
        height: 350,
        display: 'block',
    },
    rootEdit: {
        width: 400,
        display: 'block',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        marginTop: 20,
    },
    autocomplete: {
        width: '100%'
    },
};

export const AccessModes = ["Restricted", "MetadataPublished", "DataPublished"];

export const CollectionAccessModeDialog = ({collection, changeAccessMode, onClose = () => {},
    classes, loading, error}) => {
    const [selectedAccessMode, setSelectedAccessMode] = useState();
    const [openDialog, setOpenDialog] = useState(true);
    const accessModeCandidates = AccessModes;

    const handleAccessModeChange = (event) => {
        setSelectedAccessMode(event.target.value);
    };

    const handleSubmit = () => {
        if (selectedAccessMode) {
            setOpenDialog(false);
            changeAccessMode(collection.location, selectedAccessMode);
            onClose();
        }
    };

    const handleCancel = () => {
        setOpenDialog(false);
        onClose();
    };

    return (
        <Dialog
            open={openDialog}
            // onEnter={this.handleOnEnter}
            // onClose={this.handleClose}
            data-testid="permissions-dialog"
        >
            <DialogTitle id="scroll-dialog-title">Select collection access mode</DialogTitle>
            <DialogContent>
                <div>
                    <FormControl className={classes.formControl}>
                        <RadioGroup
                            aria-label="Access mode"
                            name="access-mode"
                            className={classes.group}
                            value={selectedAccessMode}
                            onChange={handleAccessModeChange}
                        >
                            {accessModeCandidates.map(mode => (
                                <FormControlLabel
                                    key={mode}
                                    value={mode}
                                    control={<Radio />}
                                    label={mode}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    disabled={Boolean(!selectedAccessMode || loading || error)}
                    data-testid="submit"
                >
                    Save
                </Button>
                <Button
                    onClick={handleCancel}
                    color="default"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const ContextualAccessModeDialog = props => {
    const {setAccessMode, loading, error} = useContext(CollectionsContext);

    return (
        <CollectionAccessModeDialog
            {...props}
            changeAccessMode={setAccessMode}
            loading={loading}
            error={error}
        />
    );
};

export default withStyles(styles)(ContextualAccessModeDialog);
