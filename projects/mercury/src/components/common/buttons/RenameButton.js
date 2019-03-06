import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog, DialogTitle, DialogContent,
    DialogActions, Button, TextField
} from "@material-ui/core";

class RenameButton extends React.Component {
    state = {
        name: '',
        renaming: false,
    };

    componentWillReceiveProps(props) {
        if (!this.state.renaming) {
            this.setState({name: props.currentName});
        }
    }

    openDialog = (e) => {
        e.stopPropagation();
        this.setState({renaming: true});
    }

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        this.setState({renaming: false});
    }

    handleRename = (e) => {
        e.stopPropagation();
        this.props.onRename(this.state.name)
            .then(shouldClose => shouldClose && this.closeDialog());
    }

    render() {
        const {children, currentName} = this.props;
        const {renaming, name} = this.state;

        return (
            <>
                <span onClick={this.openDialog}>
                    {children}
                </span>

                <Dialog
                    open={renaming}
                    onClick={e => e.stopPropagation()}
                    onClose={this.closeDialog}
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
                            onChange={event => this.setState({name: event.target.value})}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={this.closeDialog}
                            color="secondary"
                        >
                            Close
                        </Button>
                        <Button
                            onClick={this.handleRename}
                            color="primary"
                            disabled={!name || name === currentName}
                        >
                            Rename
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

RenameButton.propTypes = {
    onRename: PropTypes.func.isRequired
};

export default RenameButton;
