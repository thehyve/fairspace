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
    state = {
        editing: false
    };

    componentDidUpdate() {
        if (this.state.editing !== this.props.editing) {
            this.setState({
                title: this.props.title,
                name: this.props.name || '',
                description: this.props.description || '',
                type: this.props.type || 'LOCAL_FILE',
                editing: !!this.props.editing
            });
        }
    }

    close = () => {
        this.setState({editing: false});
    }

    handleCancel = () => {
        this.close();
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    handleSave = () => {
        if (!this.state.name) {
            return;
        }

        this.close();
        if (this.props.onSave) {
            this.props.onSave(this.state.name, this.state.description, this.state.type);
        }
    }

    handleInputChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        return (
            <Dialog
                open={this.state.editing}
                onClose={this.close}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    {this.state.title}
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
                        onChange={this.handleInputChange}
                        fullWidth
                        required
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        multiline
                        id="description"
                        label="Description"
                        name="description"
                        value={this.state.description}
                        onChange={this.handleInputChange}
                        fullWidth
                    />
                    {this.props.editType
                        ? (
                            <FormControl>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name="type"
                                    value={this.state.type}
                                    onChange={this.handleInputChange}
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
                    <Button onClick={this.handleSave} aria-label="Save" color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default CollectionEditor;
