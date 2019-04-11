import React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import LinkedDataEntityForm from "./LinkedDataEntityFormContainer";
import LinkedDataEntityButton from "./LinkedDataEntitySubmitButtonContainer";
import {ErrorMessage, LoadingInlay} from "../../common";

const LinkedDataEntityFormWithButton = props => {
    const {editable, onSubmit, subject, ...otherProps} = props;

    if (props.error) {
        return <ErrorMessage message={props.error.message} />;
    }

    if (props.loading) {
        return <LoadingInlay />;
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <LinkedDataEntityForm editable={editable} subject={subject} {...otherProps} />
            </Grid>
            {
                editable
                    ? (
                        <Grid item>
                            <LinkedDataEntityButton subject={subject} onClick={onSubmit}/>
                        </Grid>
                    )
                    : null
            }
        </Grid>
    );
};

LinkedDataEntityFormWithButton.propTypes = {
    editable: PropTypes.bool,
    subject: PropTypes.string,
    onSubmit: PropTypes.func.isRequired
};

export default LinkedDataEntityFormWithButton;
