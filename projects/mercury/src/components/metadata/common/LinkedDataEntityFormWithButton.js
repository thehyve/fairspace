import React from "react";
import PropTypes from "prop-types";
import {Button} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import LinkedDataEntityForm from "./LinkedDataEntityFormContainer";
import ErrorDialog from "../../common/ErrorDialog";

const LinkedDataEntityFormWithButton = props => {
    const {editable, buttonDisabled, onSubmit, subject, ...otherProps} = props;

    const handleButtonClick = () => {
        props.onSubmit(props.subject)
            .catch(err => ErrorDialog.showError(err, "Error while updating metadata"));
    };

    return (
        <Grid container>
            <Grid item xs={12}>
                <LinkedDataEntityForm editable={editable} subject={subject} {...otherProps} />
            </Grid>
            {
                editable
                    ? (
                        <Grid item>
                            <Button
                                onClick={handleButtonClick}
                                color="primary"
                                disabled={buttonDisabled}
                            >
                                Update
                            </Button>
                        </Grid>
                    )
                    : null
            }
        </Grid>
    );
};

LinkedDataEntityFormWithButton.propTypes = {
    editable: PropTypes.bool,
    buttonDisabled: PropTypes.bool,
    subject: PropTypes.string,
    onSubmit: PropTypes.func.isRequired
};

export default LinkedDataEntityFormWithButton;
