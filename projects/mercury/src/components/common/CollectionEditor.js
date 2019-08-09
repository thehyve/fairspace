import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class CollectionEditor extends React.Component {
    static NON_SAFE_CHARACTERS_REGEX = /[^a-z0-9_-]+/gi;

    static MAX_LOCATION_LENGTH = 127;

    state = {
        editing: true,
        name: this.props.name || '',
        description: this.props.description || '',
        connectionString: this.props.connectionString || '',
        location: this.props.location || ''
    };

    handleSave = () => {
        if (!this.isInputValid()) {
            return;
        }

        if (this.props.onSave) {
            this.props.onSave(this.state.name, this.state.description, this.state.location, this.state.connectionString);
        }
    }

    handleCancel = () => {
        this.setState({editing: false});
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    handleInputChange = (name, value) => {
        this.setState({[name]: value});
    }

    handleNameChange = (event) => {
        const shouldUpdateLocation = this.shouldUpdateLocationOnNameChange();
        const newName = event.target.value;

        this.handleInputChange('name', newName);

        if (shouldUpdateLocation) {
            this.handleInputChange('location', this.convertToSafeDirectoryName(newName));
        }
    }

    /**
     * Converts the given collection name to a safe directory name
     * @param name
     * @returns {string}
     */
    convertToSafeDirectoryName = (name) => {
        const safeName = name.replace(CollectionEditor.NON_SAFE_CHARACTERS_REGEX, '_');
        return safeName.length <= CollectionEditor.MAX_LOCATION_LENGTH ? safeName : safeName.substring(0, CollectionEditor.MAX_LOCATION_LENGTH);
    };

    /**
     * Determines whether the location should be updated when the name changes.
     *
     * Returns true if the user has not changed the location.
     * @type {function}
     */
    shouldUpdateLocationOnNameChange = () => this.convertToSafeDirectoryName(this.state.name) === this.state.location;

    /**
     * Checks whether the input is valid. Check whether the name and location are given
     * and that the location does not contain any unsafe characters.
     *
     * Please note that the location may still be invalid, if another collection uses the same
     * location. This will be checked when actually submitting the form.
     * @returns {boolean}
     */
    isInputValid = () => !!this.state.name && !!this.state.location && !this.state.location.match(CollectionEditor.NON_SAFE_CHARACTERS_REGEX);

    render() {
        return (
            <Dialog
                open={this.state.editing}
                onClose={this.props.onClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    {this.props.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>You can edit the collection details here.</DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        value={this.state.name}
                        name="name"
                        onChange={(event) => this.handleNameChange(event)}
                        fullWidth
                        required
                    />
                    <TextField
                        margin="dense"
                        multiline
                        id="description"
                        label="Description"
                        name="description"
                        value={this.state.description}
                        onChange={(event) => this.handleInputChange('description', event.target.value)}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        id="location"
                        label="Collection identifier"
                        helperText="This identifier does not allow special characters and has to be unique. It will be used in Jupyterlab as the directory name for files in this collections"
                        value={this.state.location}
                        name="location"
                        onChange={(event) => this.handleInputChange('location', event.target.value)}
                        fullWidth
                        required
                    />
                    <TextField
                        margin="dense"
                        id="connectionString"
                        label="Connection string"
                        helperText="Provider-specific connection string, keep blank for managed collections"
                        value={this.state.connectionString}
                        name="connectionString"
                        onChange={(event) => this.handleInputChange('connectionString', event.target.value)}
                        fullWidth
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleCancel} aria-label="Cancel" color="secondary">Cancel</Button>
                    <Button onClick={this.handleSave} disabled={!this.isInputValid()} aria-label="Save" color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default CollectionEditor;
