import React from 'react';
import PropTypes from 'prop-types';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@material-ui/core";

import {generateUuid, getLabel} from "../../../utils/metadataUtils";

class NewLinkedDataEntityDialog extends React.Component {
    state = {
        id: generateUuid()
    };

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        this.props.onClose();
    };

    createEntity = (e) => {
        if (e) e.stopPropagation();
        this.props.onCreate(this.props.shape, this.state.id);
    };

    handleInputChange = event => this.setState({id: event.target.value});

    render() {
        const typeLabel = getLabel(this.props.shape);
        const showDialog = this.props.open && this.props.shape !== undefined;

        return (
            <Dialog
                open={showDialog}
                onClose={this.closeDialog}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Create new {typeLabel}</DialogTitle>

                <DialogContent>
                    <TextField
                        autoFocus
                        id="name"
                        label="Id"
                        value={this.state.id}
                        name="id"
                        onChange={this.handleInputChange}
                        fullWidth
                        required
                        error={!this.hasValidId()}
                        style={{width: 400}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.closeDialog}
                        color="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={this.createEntity}
                        color="primary"
                        disabled={!this.canCreate()}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    hasValidId() {
        return new URL(`http://example.com/${this.state.id}`).toString() === `http://example.com/${this.state.id}`;
    }

    canCreate() {
        return this.state.id && this.hasValidId();
    }
}

NewLinkedDataEntityDialog.propTypes = {
    shape: PropTypes.object,
    onCreate: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
}
export default NewLinkedDataEntityDialog;
