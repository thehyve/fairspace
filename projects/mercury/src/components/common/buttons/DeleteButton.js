import React from 'react';
import PropTypes from 'prop-types';

import ConfirmationDialog from '../ConfirmationDialog';

class DeleteButton extends React.Component {
    state = {
        verifying: false
    };

    openDialog = (e) => {
        if (e) e.stopPropagation();
        if (!this.props.disabled) {
            this.setState({verifying: true});
        }
    }

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        this.setState({verifying: false});
    }

    handleAgreeClick = (e) => {
        this.closeDialog(e);
        this.props.onClick(e);
    }

    render() {
        const {children, fileDescription, disabled} = this.props;
        const {verifying} = this.state;
        const dialog = verifying && !disabled ? (
            <ConfirmationDialog
                open
                title="Confirmation"
                content={`Are you sure you want to remove ${fileDescription}?`}
                onAgree={this.handleAgreeClick}
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

DeleteButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};

DeleteButton.defaultProps = {
    disabled: false
};

export default DeleteButton;
