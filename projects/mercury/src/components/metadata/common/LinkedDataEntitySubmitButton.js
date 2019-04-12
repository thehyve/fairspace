import React from "react";
import PropTypes from "prop-types";
import {Button} from "@material-ui/core";
import ErrorDialog from "../../common/ErrorDialog";

export const LinkedDataEntityButton = (props) => {
    const onClick = () => {
        props.onClick(props.subject)
            .catch(err => ErrorDialog.showError(err, "Error while updating metadata"));
    };

    return (
        <Button
            onClick={onClick}
            color="primary"
            disabled={props.disabled}
        >
            Update
        </Button>
    );
};

LinkedDataEntityButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    subject: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};

export default LinkedDataEntityButton;
