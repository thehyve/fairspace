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
import {camelCaseToWords} from "../common/utils/genericUtils";
import ConfirmationButton from "../common/components/ConfirmationButton";

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

export const CollectionPropertyChangeDialog = ({collection, title, currentValue, availableValues, setValue, onClose,
    confirmationMessage = 'Are you sure you want to change this property?', classes}) => {
    const [selectedValue, setSelectedValue] = useState(currentValue);
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
            <DialogTitle id="property-change-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <div>
                    <FormControl className={classes.formControl}>
                        <RadioGroup
                            aria-label="Available values"
                            name="collection-property-value"
                            className={classes.group}
                            value={selectedValue}
                            onChange={handleValueChange}
                        >
                            {availableValues.map(mode => (
                                <FormControlLabel
                                    key={mode}
                                    value={mode}
                                    control={<Radio />}
                                    label={camelCaseToWords(mode)}
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
                    message={confirmationMessage}
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

export default withStyles(styles)(CollectionPropertyChangeDialog);
