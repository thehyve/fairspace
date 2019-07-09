import React from "react";
import PropTypes from "prop-types";
import {Button, Grid, CircularProgress} from "@material-ui/core";

import LinkedDataEntityForm from "./LinkedDataEntityForm";
import useLinkedData from '../UseLinkedData';
import useFormData from '../UseFormData';

const LinkedDataEntityFormContainer = ({subject, isEditable = true, ...otherProps}) => {
    const {properties, linkedDataLoading, linkedDataError} = useLinkedData(subject, isEditable);
    const {
        extendPropertiesWithChanges, onSubmit, submitDisabled,
        onAdd, onChange, onDelete, isUpdating
    } = useFormData(subject);

    let footer;

    if (isUpdating) {
        footer = <CircularProgress />;
    } else if (isEditable) {
        footer = (
            <Button
                onClick={onSubmit}
                color="primary"
                disabled={submitDisabled}
            >
                Update
            </Button>
        );
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <LinkedDataEntityForm
                    {...otherProps}
                    error={linkedDataError}
                    loading={linkedDataLoading}
                    properties={isEditable ? extendPropertiesWithChanges(properties) : properties}
                    onAdd={onAdd}
                    onChange={onChange}
                    onDelete={onDelete}
                />
            </Grid>
            {footer && <Grid item>{footer}</Grid>}
        </Grid>
    );
};

LinkedDataEntityFormContainer.propTypes = {
    subject: PropTypes.string.isRequired,
    isEditable: PropTypes.bool,
};

export default LinkedDataEntityFormContainer;
