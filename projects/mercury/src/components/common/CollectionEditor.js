import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from "@material-ui/core/Select/Select";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";

class CollectionEditor extends React.Component {
    static LOCATION_REGEX = /[^a-z0-9_-]+/gi;

    state = {
        editing: true,
        name: this.props.name || '',
        description: this.props.description || '',
        type: this.props.type || 'LOCAL_FILE',
        location: this.props.location || ''
    };

    handleSave = () => {
        if (!this.isInputValid()) {
            return;
        }

        if (this.props.onSave) {
            this.props.onSave(this.state.name, this.state.description, this.state.location, this.state.type);
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
            this.handleInputChange('location', this.nameToLocation(newName));
        }
    }

    /**
     * Creates a new location based on the name
     * @param name
     * @returns {string}
     */
    nameToLocation = (name) => name.replace(CollectionEditor.LOCATION_REGEX, '_');

    /**
     * Determines whether the location should be updated when the name changes.
     *
     * Returns true if the user has not changed the location.
     * @type {function}
     */
    shouldUpdateLocationOnNameChange = () => this.nameToLocation(this.state.name) === this.state.location;

    isInputValid = () => !!this.state.name && !!this.state.location;

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
                    {this.props.editType
                        ? (
                            <FormControl>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name="type"
                                    value={this.state.type}
                                    onChange={(event) => this.handleInputChange('type', event.target.value)}
                                >
                                    <MenuItem value="LOCAL_FILE">On Premise</MenuItem>
                                    <MenuItem value="AZURE_BLOB_STORAGE">Azure Blob Storage</MenuItem>
                                    <MenuItem value="S3_BUCKET">Amazon S3 Bucket</MenuItem>
                                    <MenuItem value="GOOGLE_CLOUD_BUCKET">Google Cloud Bucket</MenuItem>
                                </Select>
                            </FormControl>
                        )
                        : null}

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
