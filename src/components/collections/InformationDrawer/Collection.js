import React from 'react';
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";

class Collection extends React.Component{
    constructor(props) {
        super(props);
        this.onDidChangeDetails = props.onDidChangeDetails;
        this.collectionStore = props.collectionStore;

        this.state = {
            collection: props.collection,
            editValues: this.determineEditValues(props.collection),
            editing: false,
            showEditButton: false
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            collection: props.collection,
            editing: false,
            editValues: this.determineEditValues(props.collection)
        });
    }

    resetValues() {
        this.setState({
            editValues: this.determineEditValues(this.state.collection)
        })
    }

    determineEditValues(collection) {
        return {
            name: collection.metadata.name  || collection.name || '',
            description: collection.metadata.description || ''
        }
    }

    closeEditDialog() {
        this.setState({editing: false});
    }

    storeChangedDetails(collectionId, parameters) {
        // Update information about the name and collection
        return this.collectionStore.updateCollection(collectionId, parameters.name, parameters.description);
    }

    handleCancel() {
        this.resetValues();
        this.closeEditDialog();
    }

    handleChangeDetails() {
        this.closeEditDialog();

        this.storeChangedDetails(this.state.collection.id, this.state.editValues)
            .then(() => {
                if(this.onDidChangeDetails) {
                    this.onDidChangeDetails(this.state.collection.id, this.state.editValues);
                }
            })
            .catch((e) => {
                console.error("An error occurred while updating collection metadata", e);
            });
    }

    handleInputChange(event) {
        let currentEditValues = this.state.editValues;
        currentEditValues[event.target.name] = event.target.value;
        this.setState(currentEditValues);
    }

    handleTextMouseEnter() {
        this.setState({showEditButton: true});
    }
    handleTextMouseLeave() {
        this.setState({showEditButton: false});
    }

    handleTextClick() {
        this.setState({editing: true});
    }


    render() {
        return (
            <div>
                <div
                    onClick={this.handleTextClick.bind(this)}
                    onMouseEnter={this.handleTextMouseEnter.bind(this)}
                    onMouseLeave={this.handleTextMouseLeave.bind(this)}
                >
                    <Typography variant="title">{this.state.collection.metadata.name} {this.state.showEditButton ? (<Icon>edit</Icon>) : ''}</Typography>
                    <Typography variant="subheading">{this.state.collection.metadata.description}</Typography>
                </div>

                <Dialog
                    open={this.state.editing}
                    onClose={this.closeEditDialog.bind(this)}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Edit collection: {this.state.collection.metadata.name}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            You can edit the collection name and description here.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Name"
                            value={this.state.editValues.name}
                            name="name"
                            onChange={this.handleInputChange.bind(this)}
                            fullWidth
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            multiline={true}
                            id="description"
                            label="Description"
                            name="description"
                            value={this.state.editValues.description}
                            onChange={this.handleInputChange.bind(this)}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCancel.bind(this)} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleChangeDetails.bind(this)} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>


            </div>
        );
    }
}

export default Collection;




