import React from 'react';
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

    openDialog = (e) => {
        e.stopPropagation();
        this.setState({verifying: true});
    }

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        this.setState({verifying: false});
    }

    handleClick = (e) => {
        this.closeDialog(e);
        if (this.onClick) {
            window.setImmediate(() => this.onClick(e));
        }
    }


    renderConfirmationDialog() {
        if (this.state.verifying) {
            const content = `${this.props['aria-label']}?`;
            return (
                <ConfirmationDialog
                    open={this.state.verifying}
                    title="Confirmation"
                    content={content}
                    onAgree={this.handleClick}
                    onDisagre={this.closeDialog}
                    onClose={this.closeDialog}
                />
            );
        }

        return '';
    }

    render() {
        return (
            <div style={{visibility: this.props.visibility}}>
                <IconButton
                    {...this.componentProps}
                    onClick={this.openDialog}
                    disabled={this.props.disabled}
                >
                    {this.props.children}
                </IconButton>
                {this.renderConfirmationDialog()}
            </div>
        );
    }
}

export default ButtonWithVerification;
