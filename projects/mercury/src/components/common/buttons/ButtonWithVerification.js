import React from 'react';

import ConfirmationDialog from '../ConfirmationDialog';

class ButtonWithVerification extends React.Component {
    state = {
        verifying: false
    };

    openDialog = (e) => {
        e.stopPropagation();
        this.setState({verifying: true});
    }

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        this.setState({verifying: false});
    }

    handleClick = (e) => {
        this.props.onClick(e);
        this.closeDialog(e);
    }

    renderConfirmationDialog() {
        if (this.state.verifying) {
            return (
                <ConfirmationDialog
                    open
                    title="Confirmation"
                    content={`Are you sure you want to remove ${this.props.file}`}
                    onAgree={this.handleClick}
                    onDisagree={this.closeDialog}
                    onClose={this.closeDialog}
                />
            );
        }

        return '';
    }

    render() {
        const {children} = this.props;
        return (
            <>
                <span onClick={this.openDialog}>
                    {children}
                </span>
                {this.renderConfirmationDialog()}
            </>
        );
    }
}

export default ButtonWithVerification;
