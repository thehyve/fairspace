import React from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";

class CreateDirectoryButton extends React.Component{
    constructor(props) {
        super(props);
        const {
            onCreate,
            children,
            ...componentProps
        } = props;

        this.onCreate = onCreate;
        this.componentProps = componentProps;

        this.state = {
            creating: false,
            name: ''
        };
    }

    componentWillReceiveProps(props) {
        if(props.onCreate)
            this.onCreate = props.onCreate;

        this.setState({
            creating: false
        });
    }

    openDialog() {
        this.setState({creating: true, name: ''});
    }

    closeDialog() {
        this.setState({creating: false});
    }

    createDirectory() {
        if(this.onCreate) {
            this
                .onCreate(this.state.name)
                .then(this.closeDialog.bind(this))
                .catch(() => { /* Ignore the exception as it is handled by onCreate, but just prevents the dialog of closing */ });
        }
    }

    handleInputChange(event) {
        let newValues = {}
        newValues[event.target.name] = event.target.value;
        this.setState(newValues);
    }

    render() {
        return (
            <div>
                <IconButton {...this.componentProps} onClick={this.openDialog.bind(this)}>
                    {this.props.children}
                </IconButton>

                <Dialog
                    open={this.state.creating}
                    onClose={this.closeDialog.bind(this)}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Create new directory</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Name"
                            value={this.state.name}
                            name="name"
                            onChange={this.handleInputChange.bind(this)}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeDialog.bind(this)} color="secondary">
                            Close
                        </Button>
                        <Button onClick={this.createDirectory.bind(this)} color="primary" disabled={!this.state.name}>
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default CreateDirectoryButton;




