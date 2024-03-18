// @flow
import React, {useState} from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    FormControl,
    FormControlLabel,
    ListItemText,
    Radio,
    RadioGroup
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import {camelCaseToWords} from '../common/utils/genericUtils';
import ConfirmationButton from '../common/components/ConfirmationButton';
import {descriptionForStatus} from './collectionUtils';
import {statuses} from './CollectionAPI';
import type {Status} from './CollectionAPI';

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

    const handleValueChange = event => {
        setSelectedValue(event.target.value);
    };

    const handleSubmit = () => {
        if (selectedValue) {
            setOpenDialog(false);
            setValue(collection.name, selectedValue);
            onClose();
        }
    };

    const handleCancel = () => {
        setOpenDialog(false);
        onClose();
    };

    const confirmationMessage = (status: Status) => {
        switch (status) {
            case 'Active':
                return (
                    <span>
                        Are you sure you want to <b>activate</b> collection <em>{collection.name}</em>?<br />
                        Editing data and metadata will be enabled.
                    </span>
                );
            case 'ReadOnly':
                return (
                    <span>
                        Are you sure you want to make collection <em>{collection.name}</em> <b>read-only</b>?<br />
                        Data will be immutable.
                    </span>
                );
            case 'Archived':
                return (
                    <span>
                        Are you sure you want to <b>archive</b> collection <em>{collection.name}</em>?<br />
                        Archiving the collection will make the data unavailable for reading.
                    </span>
                );
            default:
                throw Error(`Unknown status: ${status}`);
        }
    };

    return (
        <Dialog open={openDialog} data-testid="property-change-dialog" onClose={handleCancel}>
            <DialogTitle id="property-change-dialog-title">Change collection status</DialogTitle>
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
                            {statuses
                                .filter(status => collection.availableStatuses.includes(status))
                                .map(status => (
                                    <FormControlLabel
                                        key={status}
                                        value={status}
                                        control={<Radio />}
                                        label={
                                            <ListItemText
                                                primary={camelCaseToWords(status, '-')}
                                                secondary={descriptionForStatus(status)}
                                            />
                                        }
                                    />
                                ))}
                        </RadioGroup>
                    </FormControl>
                </div>
            </DialogContent>
            <DialogActions>
                <ConfirmationButton
                    onClick={handleSubmit}
                    disabled={Boolean(!selectedValue)}
                    message={confirmationMessage(selectedValue)}
                    agreeButtonText="Yes"
                    dangerous
                >
                    <Button color="primary" disabled={Boolean(!selectedValue)} data-testid="submit">
                        Save
                    </Button>
                </ConfirmationButton>
                <Button onClick={handleCancel}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default withStyles(styles)(CollectionStatusChangeDialog);
