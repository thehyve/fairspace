import React from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

class ButtonWithVerification extends React.Component {
    state = {
        verifying: false
    }

    constructor(props) {
        super(props);
        const {
            onClick,
            children,
            dialogText,
            ...componentProps
        } = props;

        this.dialogText = dialogText || 'Are you sure?';
        this.onClick = onClick;
        this.componentProps = componentProps;
    }

    componentWillReceiveProps(props) {
        this.setState({
            verifying: false
        });
    }

    openDialog(e) {
        e.stopPropagation();
        this.setState({verifying: true});
    }

    closeDialog(e) {
        if (e) e.stopPropagation();
        this.setState({verifying: false});
    }

    handleClick(e) {
        this.closeDialog(e);
        if (this.onClick) {
            window.setImmediate(() => this.onClick(e));
        }
    }

    render() {
        return (
            <div>
                <IconButton {...this.componentProps} onClick={this.openDialog.bind(this)} style={this.props.style}>
                    {this.props.children}
                </IconButton>

                <Dialog
                    open={this.state.verifying}
                    onClick={(e) => e.stopPropagation()}
                    onClose={this.closeDialog.bind(this)}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">{this.dialogText}</DialogTitle>
                    <DialogActions>
                        <Button onClick={this.handleClick.bind(this)} color="secondary">
                            Yes
                        </Button>
                        <Button onClick={this.closeDialog.bind(this)} color="primary">
                            No
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default ButtonWithVerification;




