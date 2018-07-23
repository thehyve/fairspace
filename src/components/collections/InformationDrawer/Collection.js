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
    state = {
        collection: {},
        editValues: {},
        editing: false,
        showEditButton: false
    }

    constructor(props) {
        super(props);
        this.onChangeDetails = props.onChangeDetails;

        this.state = {
            collection: props.collection,
            editValues: {
                name: props.collection.name ? props.collection.name : '',
                description: props.collection.description ? props.collection.description : ''
            }
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            collection: props.collection,
            editing: false,
            editValues: {
                name: props.collection.name ? props.collection.name : '',
                description: props.collection.description ? props.collection.description : ''
            }
        });
    }

    resetValues() {
        this.setState({
            editValues: {
                name: this.state.collection.name ? this.state.collection.name : '',
                description: this.state.collection.description ? this.state.collection.description : ''
            }
        })
    }

    close() {
        this.setState({editing: false});
    }

    handleCancel() {
        this.resetValues();
        this.close();
    }

    handleChangeDetails() {
        this.onChangeDetails(this.state.collection.id, this.state.editValues);
        this.close();
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
                    <Typography variant="title">{this.state.collection.name} {this.state.showEditButton ? (<Icon>edit</Icon>) : ''}</Typography>
                    <Typography variant="subheading">{this.state.collection.description}</Typography>
                </div>

                <Dialog
                    open={this.state.editing}
                    onClose={this.close.bind(this)}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Edit collection: {this.state.collection.name}</DialogTitle>
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




