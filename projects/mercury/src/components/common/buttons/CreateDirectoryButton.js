import React from 'react';
import {
    Dialog, DialogTitle, DialogContent,
    DialogActions, Button, TextField
} from "@material-ui/core";

class CreateDirectoryButton extends React.Component {
    state = {
        creating: false,
        name: ''
    };

    openDialog = (e) => {
        e.stopPropagation();
        this.setState({creating: true, name: ''});
    }

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        this.setState({creating: false});
    }

    createDirectory = (e) => {
        e.stopPropagation();

        this.props.onCreate(this.state.name)
            .then(shouldClose => shouldClose && this.closeDialog());
    }

    render() {
        const {children} = this.props;
        const {creating, name} = this.state;

        return (
            <>
                <span onClick={this.openDialog}>
                    {children}
                </span>

                <Dialog
                    open={creating}
                    onClick={e => e.stopPropagation()}
                    onClose={this.closeDialog}
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
                            onChange={event => this.setState({name: event.target.value})}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeDialog} color="secondary">Close</Button>
                        <Button onClick={this.createDirectory} color="primary" disabled={!name}>Create</Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

export default CreateDirectoryButton;
