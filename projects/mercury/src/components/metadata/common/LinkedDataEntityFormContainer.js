import React from "react";
import PropTypes from "prop-types";
import {Button, Grid, CircularProgress} from "@material-ui/core";

import LinkedDataEntityForm from "./LinkedDataEntityForm";
import useLinkedData from '../UseLinkedData';
import useFormData from '../UseFormData';

const LinkedDataEntityFormContainer = ({subject, defaultType = null, isEditable = true, ...otherProps}) => {
    const {properties, linkedDataLoading, linkedDataError} = useLinkedData(subject, defaultType, isEditable);
    const {
        extendPropertiesWithChanges, onSubmit, submitDisabled,
        onAdd, onChange, onDelete, isUpdating
    } = useFormData(subject, defaultType);

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

    const visibleProperties = isEditable
        ? extendPropertiesWithChanges(properties)
        : properties.filter(p => p.values.length);

    return (
        <Grid container>
            <Grid item xs={12}>
                <LinkedDataEntityForm
                    {...otherProps}
                    error={linkedDataError}
                    loading={linkedDataLoading}
                    properties={visibleProperties}
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
