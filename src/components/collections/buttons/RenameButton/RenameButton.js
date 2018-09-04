import React from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";

class RenameButton extends React.Component{
    constructor(props) {
        super(props);
        const {
            currentName,
            onRename,
            children,
            ...componentProps
        } = props;

        this.currentName = currentName;
        this.onRename = onRename;
        this.componentProps = componentProps;

        this.state = {
            renaming: false,
            name: currentName
        };
    }

    componentWillReceiveProps(props) {
        this.onRename = props.onRename;
        this.currentName = props.currentName;

        this.setState({
            renaming: false,
            name: this.currentName
        });
    }

    openDialog(e) {
        e.stopPropagation();
        this.setState({renaming: true, name: this.currentName});
    }

    closeDialog(e) {
        if(e) e.stopPropagation();
        this.setState({renaming: false});
    }

    handleRename(e) {
        e.stopPropagation();

        if(this.onRename) {
            this
                .onRename(this.state.name)
                .then(this.closeDialog.bind(this))
                .catch(() => { /* Ignore the exception as it is handled by onRename, but just prevents the dialog of closing */ });
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
                    open={this.state.renaming}
                    onClick={(e) => e.stopPropagation()}
                    onClose={this.closeDialog.bind(this)}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Rename {this.currentName}</DialogTitle>
                    <DialogContent>
                        Enter a new name for {this.currentName}
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
                        <Button onClick={this.handleRename.bind(this)} color="primary" disabled={!this.state.name || this.state.name === this.currentName}>
                            Rename
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default RenameButton;




