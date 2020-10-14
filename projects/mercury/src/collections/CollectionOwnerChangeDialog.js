// @flow
import React, {useState} from 'react';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import {compareBy} from "../common/utils/genericUtils";
import Dropdown from "../metadata/common/values/Dropdown";
import ConfirmationButton from "../common/components/ConfirmationButton";

export const CollectionOwnerChangeDialog = ({collection, workspaces, changeOwner, onClose}) => {
    const [selectedValue, setSelectedValue] = useState();
    const [openDialog, setOpenDialog] = useState(true);

    const options = workspaces
        .sort(compareBy('name'))
        .map(workspace => (
            {
                label: workspace.name,
                ...workspace
            }
        ));

    const handleValueChange = (selectedOwnerWorkspace) => {
        if (selectedOwnerWorkspace) {
            setSelectedValue({label: selectedOwnerWorkspace.name, ...selectedOwnerWorkspace});
        } else {
            setSelectedValue(null);
        }
    };

    const handleSubmit = () => {
        if (selectedValue) {
            setOpenDialog(false);
            changeOwner(collection, selectedValue);
        }
    };

    const handleCancel = () => {
        setOpenDialog(false);
        onClose();
    };

    return (
        <Dialog
            open={openDialog}
            data-testid="owner-workspace-change-dialog"
            onClose={handleCancel}
        >
            <DialogTitle id="property-change-dialog-title">Transfer the collection ownership to another workspace</DialogTitle>
            <DialogContent>
                <div>
                    <Dropdown
                        data-testid="owner-workspace-change-dropdown"
                        options={options}
                        clearTextOnSelection={false}
                        isOptionDisabled={option => option.iri === collection.ownerWorkspace}
                        onChange={handleValueChange}
                        label="Select a workspace"
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <ConfirmationButton
                    onClick={handleSubmit}
                    disabled={Boolean(!selectedValue)}
                    message={(
                        <span>
                           Are you sure you want to <b>transfer the ownership</b> on
                           collection <em>{collection.name}</em> to workspace <em>{selectedValue && selectedValue.label}</em>?
                        </span>
                    )}
                    agreeButtonText="Yes"
                    dangerous
                >
                    <Button
                        color="primary"
                        disabled={Boolean(!selectedValue)}
                        data-testid="submit"
                    >
                        Save
                    </Button>
                </ConfirmationButton>
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

export default CollectionOwnerChangeDialog;
