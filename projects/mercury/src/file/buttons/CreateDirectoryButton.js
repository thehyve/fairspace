import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@material-ui/core";
import useIsMounted from "react-is-mounted-hook";

const CreateDirectoryButton = ({children, disabled, onCreate}) => {
    const [opened, setOpened] = useState(false);
    const [name, setName] = useState('');
    const isMounted = useIsMounted();

    const openDialog = (e) => {
        if (e) e.stopPropagation();
        setName('');
        setOpened(true);
    };

    const closeDialog = (e) => {
        if (e) e.stopPropagation();
        setOpened(false);
    };

    const createDirectory = (e) => {
        if (e) e.stopPropagation();

        onCreate(name)
            .then(shouldClose => isMounted() && shouldClose && closeDialog());
    };

    return (
        <>
            <span style={{display: 'inherit'}} onClick={e => !disabled && openDialog(e)}>
                {children}
            </span>

            <Dialog
                open={opened}
                onClick={e => e.stopPropagation()}
                onClose={closeDialog}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Create new directory</DialogTitle>
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
                    <Button onClick={createDirectory} color="primary" disabled={!name}>Create</Button>
                    <Button onClick={closeDialog} color="default">Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CreateDirectoryButton;
