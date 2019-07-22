import React, {useContext} from "react";
import PropTypes from "prop-types";
import {Button, CircularProgress, Grid} from "@material-ui/core";

import LinkedDataEntityForm from "./LinkedDataEntityForm";
import useLinkedData from '../UseLinkedData';
import useFormData from '../UseFormData';
import LinkedDataContext from "../LinkedDataContext";
import useFormSubmission from "../useFormSubmission";

const LinkedDataEntityFormContainer = ({subject, defaultType = null, isEntityEditable = true, ...otherProps}) => {
    const {submitLinkedDataChanges, extendProperties} = useContext(LinkedDataContext);
    const {properties, values, linkedDataLoading, linkedDataError} = useLinkedData(subject, defaultType);

    const {
        addValue, updateValue, deleteValue, clearForm,
        updates, hasFormUpdates, valuesWithUpdates,

        validateAll, validationErrors, isValid
    } = useFormData(values);

    const {isUpdating, submitForm} = useFormSubmission(
        () => submitLinkedDataChanges(subject, updates, defaultType)
            .then(() => clearForm()),
        subject
    );

    // Apply context-specific logic to the properties and filter on visibility
    const extendedProperties = extendProperties({properties, subject, isEntityEditable});

    const validateAndSubmit = () => {
        const hasErrors = validateAll(extendedProperties);

        if (!hasErrors) submitForm();
    };

    let footer;

    if (isUpdating) {
        footer = <CircularProgress />;
    } else if (isEntityEditable) {
        footer = (
            <Button
                onClick={validateAndSubmit}
                color="primary"
                disabled={!hasFormUpdates || !isValid}
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
                    properties={extendedProperties}
                    values={valuesWithUpdates}
                    validationErrors={validationErrors}
                    onAdd={addValue}
                    onChange={updateValue}
                    onDelete={deleteValue}
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
