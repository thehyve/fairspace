import React from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import ConfirmationDialog from '../../../generic/ConfirmationDialog/ConfirmationDialog';

class ButtonWithVerification extends React.Component {
    state = {
        verifying: false
    };

    constructor(props) {
        super(props);
        const {
            onClick,
            dialogText,
            ...componentProps
        } = props;

        this.dialogText = dialogText || 'Are you sure?';
        this.onClick = onClick;
        this.componentProps = componentProps;
    }

    componentDidMount() {
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


    renderConfirmationDialog() {
        if(this.state.verifying) {
            const content = this.props['aria-label'] + '?';
            return (<ConfirmationDialog open={this.state.verifying}
                                        title={'Confirmation'}
                                        content={content}
                                        onAgree={this.handleClick.bind(this)}
                                        onDisagree={this.closeDialog.bind(this)}
                                        onClose={this.closeDialog.bind(this)}/>);
        }

        return '';
    }

    render() {
        return (
            <div style={{visibility: this.props.visibility}}>
                <IconButton {...this.componentProps}
                            onClick={this.openDialog.bind(this)}
                            disabled={this.props.disabled}>
                    {this.props.children}
                </IconButton>
                {this.renderConfirmationDialog()}
            </div>
        );
    }
}

export default ButtonWithVerification;




