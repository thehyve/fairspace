import React from 'react';

import ConfirmationDialog from '../ConfirmationDialog';

class DeleteButton extends React.Component {
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
        this.closeDialog(e);
        this.props.onClick(e);
    }

    render() {
        const {children, file} = this.props;
        const {verifying} = this.state;
        const dialog = verifying ? (
            <ConfirmationDialog
                open
                title="Confirmation"
                content={`Are you sure you want to remove ${file}?`}
                onAgree={this.handleClick}
                onDisagree={this.closeDialog}
                onClose={this.closeDialog}
            />
        ) : null;

        return (
            <>
                <span onClick={this.openDialog}>
                    {children}
                </span>
                {dialog}
            </>
        );
    }
}

export default DeleteButton;
