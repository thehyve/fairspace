import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

class ProjectEditor extends React.Component {
    state = {
        editing: true
    };

    handleCancel = () => {
        this.setState({editing: false});
        if (this.props.onClose) {
            this.props.onClose();
        }
    };

    render() {
        return (
            <Dialog
                open={this.state.editing}
                onClose={this.props.onClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    Edit project
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>You can edit the project details here.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleCancel} aria-label="Cancel" color="secondary">Cancel</Button>
                    <Button disabled aria-label="Save" color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default ProjectEditor;
