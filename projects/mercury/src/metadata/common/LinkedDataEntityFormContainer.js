import React, {useContext} from "react";
import PropTypes from "prop-types";
import {Button, CircularProgress, Grid} from "@material-ui/core";
import {ConfirmationDialog} from '../../common';

import LinkedDataEntityForm from "./LinkedDataEntityForm";
import useFormData from '../UseFormData';
import LinkedDataContext from "../LinkedDataContext";
import FormContext from "./FormContext";
import useFormSubmission from "../UseFormSubmission";
import useNavigationBlocker from "../../common/hooks/UseNavigationBlocker";
import useLinkedData from "../UseLinkedData";

const LinkedDataEntityFormContainer = ({
    subject, editable = true, fullpage = false,
    properties, values, linkedDataLoading, linkedDataError, updateLinkedData, ...otherProps
}) => {
    const {submitLinkedDataChanges, extendProperties, hasEditRight} = useContext(LinkedDataContext);

    const {
        addValue, updateValue, deleteValue, clearForm,
        getUpdates, hasFormUpdates, valuesWithUpdates,

        validateAll, validationErrors, isValid
    } = useFormData(values);

    const {isUpdating, submitForm} = useFormSubmission(
        () => submitLinkedDataChanges(subject, getUpdates())
            .then(() => {
                clearForm();
                updateLinkedData();
            }),
        subject
    );

    const canEdit = editable && hasEditRight;

    const {
        confirmationShown, hideConfirmation, executeNavigation
    } = useNavigationBlocker(hasFormUpdates && canEdit);


    // Apply context-specific logic to the properties and filter on visibility
    const extendedProperties = extendProperties({properties, subject, isEntityEditable: canEdit});

    const validateAndSubmit = () => {
        const hasErrors = validateAll(extendedProperties);

        if (!hasErrors) submitForm();
    };

    const formId = `entity-form-${subject}`;
    let footer;

    if (isUpdating) {
        footer = <CircularProgress />;
    } else if (canEdit) {
        footer = (
            <Button
                type="submit"
                form={formId}
                variant={fullpage ? 'contained' : 'text'}
                color="primary"
                onClick={validateAndSubmit}
                disabled={!hasFormUpdates || !isValid}
            >
                Update
            </Button>
        );
    }

    return (
        <>
            <FormContext.Provider value={{submit: validateAndSubmit}}>
                <Grid container>
                    <Grid item xs={12}>
                        <LinkedDataEntityForm
                            {...otherProps}
                            id={formId}
                            editable={canEdit}
                            onSubmit={validateAndSubmit}
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
            </FormContext.Provider>
            {confirmationShown && (
                <ConfirmationDialog
                    open
                    title="Unsaved changes"
                    content={'You have unsaved changes, are you sure you want to navigate away?'
                        + ' Your pending changes will be lost.'}
                    agreeButtonText="Navigate"
                    disagreeButtonText="back to form"
                    onAgree={() => executeNavigation()}
                    onDisagree={hideConfirmation}
                />
            )}
        </>
    );
};

LinkedDataEntityFormContainer.propTypes = {
    subject: PropTypes.string.isRequired,
    isEditable: PropTypes.bool,
};


export const LinkedDataEntityFormWithLinkedData = ({subject, isMetaDataEditable}) => {
    const {properties, values, linkedDataLoading, linkedDataError, updateLinkedData} = useLinkedData(subject);

    return (
        <LinkedDataEntityFormContainer
            subject={subject}
            isEntityEditable={isMetaDataEditable}
            properties={properties}
            values={values}
            linkedDataLoading={linkedDataLoading}
            linkedDataError={linkedDataError}
            updateLinkedData={updateLinkedData}
        />
    );
};

export default LinkedDataEntityFormContainer;
