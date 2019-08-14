import React, {useContext} from "react";
import PropTypes from "prop-types";
import {Button, CircularProgress, Grid} from "@material-ui/core";

import LinkedDataEntityForm from "./LinkedDataEntityForm";
import useLinkedData from '../UseLinkedData';
import useFormData from '../UseFormData';
import LinkedDataContext from "../LinkedDataContext";
import useFormSubmission from "../useFormSubmission";

const LinkedDataEntityFormContainer = ({subject, isEntityEditable = true, fullpage = false, ...otherProps}) => {
    const {submitLinkedDataChanges, extendProperties, hasEditRight} = useContext(LinkedDataContext);
    const {properties, values, linkedDataLoading, linkedDataError} = useLinkedData(subject);

    const {
        addValue, updateValue, deleteValue, clearForm, onBlur,
        updates, hasFormUpdates, valuesWithUpdates,

        validateAll, validationErrors, isValid
    } = useFormData(values);

    const {isUpdating, submitForm} = useFormSubmission(
        () => submitLinkedDataChanges(subject, updates)
            .then(() => clearForm()),
        subject
    );

    const canEdit = isEntityEditable && hasEditRight;

    // Apply context-specific logic to the properties and filter on visibility
    const extendedProperties = extendProperties({properties, subject, isEntityEditable: canEdit});

    const validateAndSubmit = () => {
        const hasErrors = validateAll(extendedProperties);

        if (!hasErrors) submitForm();
    };

    let footer;

    if (isUpdating) {
        footer = <CircularProgress />;
    } else if (canEdit) {
        footer = (
            <Button
                type="submit"
                form={`entity-form-${subject}`}
                variant={fullpage ? 'contained' : 'text'}
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
                <form
                    id={`entity-form-${subject}`}
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        validateAndSubmit();
                    }}
                    noValidate
                >
                    <LinkedDataEntityForm
                        {...otherProps}
                        onMultiLineCtrlEnter={() => {
                            validateAndSubmit();
                        }}
                        error={linkedDataError}
                        loading={linkedDataLoading}
                        properties={extendedProperties}
                        values={valuesWithUpdates}
                        validationErrors={validationErrors}
                        onAdd={addValue}
                        onChange={updateValue}
                        onDelete={deleteValue}
                        onBlur={onBlur}
                    />
                </form>
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
