import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Button} from "@material-ui/core";
import {hasMetadataFormUpdates} from "../../../reducers/metadataFormReducers";
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

const mapStateToProps = (state, ownProps) => ({
    disabled: ownProps.disabled || !hasMetadataFormUpdates(state, ownProps.subject)
});

export default connect(mapStateToProps)(LinkedDataEntityButton);
