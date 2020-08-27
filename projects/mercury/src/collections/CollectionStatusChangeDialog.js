// @flow
import React, {useState} from 'react';
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
import FormHelperText from "@material-ui/core/FormHelperText";
import {camelCaseToWords} from "../common/utils/genericUtils";
import ConfirmationButton from "../common/components/ConfirmationButton";
import {getStatusDescription} from "./collectionUtils";
import {statuses} from './CollectionAPI';

export const styles = {
    group: {
        width: 350
    },
    groupItem: {
        marginBottom: 10
    },
    helperText: {
        marginLeft: 32,
        marginTop: 0
    }
};

export const CollectionStatusChangeDialog = ({collection, setValue, onClose, classes}) => {
    const [selectedValue, setSelectedValue] = useState(collection.status);
    const [openDialog, setOpenDialog] = useState(true);

    const handleValueChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleSubmit = () => {
        if (selectedValue) {
            setOpenDialog(false);
            setValue(collection.location, selectedValue);
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
            data-testid="property-change-dialog"
        >
            <DialogTitle id="property-change-dialog-title">Select collection status</DialogTitle>
            <DialogContent>
                <div>
                    <FormControl>
                        <RadioGroup
                            aria-label="Available values"
                            name="collection-property-value"
                            className={classes.group}
                            value={selectedValue}
                            onChange={handleValueChange}
                        >
                            {statuses.filter(status => collection.availableStatuses.includes(status))
                                .map(status => (
                                    <span className={classes.groupItem} key={status}>
                                        <FormControlLabel
                                            value={status}
                                            control={<Radio />}
                                            label={camelCaseToWords(status)}
                                        />
                                        <FormHelperText className={classes.helperText}>
                                            {getStatusDescription(status)}
                                        </FormHelperText>
                                    </span>
                                ))}
                        </RadioGroup>
                    </FormControl>
                </div>
            </DialogContent>
            <DialogActions>
                <ConfirmationButton
                    onClick={handleSubmit}
                    disabled={Boolean(!selectedValue)}
                    message={`Are you sure you want to change the status of collection ${collection.name} to ${selectedValue}`
                        + ` (${getStatusDescription(selectedValue)})?`}
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

export default withStyles(styles)(CollectionStatusChangeDialog);
