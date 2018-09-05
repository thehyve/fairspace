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

    openDialog(e) {
        e.stopPropagation();
        this.setState({creating: true, name: ''});
    }

    closeDialog(e) {
        if(e) e.stopPropagation();
        this.setState({creating: false});
    }

    createDirectory(e) {
        e.stopPropagation();
        if(this.onCreate) {
            this
                .onCreate(this.state.name)
                .then((shouldClose) => shouldClose && this.closeDialog.bind(this))
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
                    onClick={(e) => e.stopPropagation()}
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




