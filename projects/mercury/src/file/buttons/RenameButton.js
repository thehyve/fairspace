import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@material-ui/core";
import useIsMounted from "react-is-mounted-hook";

const RenameButton = ({disabled, currentName, onRename, children}) => {
    const [opened, setOpened] = useState(false);
    const [name, setName] = useState('');
    const isMounted = useIsMounted();

    // Set name whenever it is changed in the props
    useEffect(() => {
        if (!opened) {
            setName(currentName);
        }
    }, [opened, currentName]);

    const openDialog = (e) => {
        if (e) e.stopPropagation();
        if (!disabled) {
            setOpened(true);
        }
    };

    const closeDialog = e => {
        if (e) e.stopPropagation();
        setOpened(false);
    };

    const handleRename = (e) => {
        e.stopPropagation();
        onRename(name)
            .then(shouldClose => isMounted() && shouldClose && setOpened(false));
    };

    const dialog = opened ? (
        <Dialog
            open
            onClick={e => e.stopPropagation()}
            onClose={closeDialog}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle
                id="form-dialog-title"
            >
                {`Rename ${currentName}`}
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Name"
                    value={name}
                    name="name"
                    onChange={e => setName(e.target.value)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={closeDialog}
                    color="secondary"
                >
                    Close
                </Button>
                <Button
                    data-testid="rename-button"
                    onClick={handleRename}
                    color="primary"
                    disabled={!name || name === currentName}
                >
                    Rename
                </Button>
            </DialogActions>
        </Dialog>
    ) : null;

    return (
        <>
            <span onClick={openDialog}>
                {children}
            </span>
            {dialog}
        </>
    );
};

RenameButton.propTypes = {
    onRename: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};

RenameButton.defaultProps = {
    disabled: false
};

export default RenameButton;
