import React, {useContext, useState} from "react";
import PropTypes from "prop-types";
import {Button, CircularProgress, Grid, IconButton} from "@material-ui/core";
import {Edit} from '@material-ui/icons';

import {ConfirmationDialog} from '../../common';
import LinkedDataEntityForm from "./LinkedDataEntityForm";
import useFormData from '../UseFormData';
import LinkedDataContext from "../LinkedDataContext";
import FormContext from "./FormContext";
import useFormSubmission from "../UseFormSubmission";
import useNavigationBlocker from "../../common/hooks/UseNavigationBlocker";
import useLinkedData from "../UseLinkedData";
import {DATE_DELETED_URI} from "../../constants";

const LinkedDataEntityFormContainer = ({
    subject, editable = false, showEditButtons = false, fullpage = false,
    properties, values, linkedDataLoading, linkedDataError, updateLinkedData, setHasUpdates = () => {}, ...otherProps
}) => {
    const [editingEnabled, setEditingEnabled] = useState(editable && !showEditButtons);
    const {submitLinkedDataChanges, extendProperties} = useContext(LinkedDataContext);

    const {
        addValue, updateValue, deleteValue, clearForm, getUpdates, hasFormUpdates, valuesWithUpdates,
        validateAll, validationErrors, isValid
    } = useFormData(values, properties);

    setHasUpdates(hasFormUpdates);

    const {isUpdating, submitForm} = useFormSubmission(
        () => submitLinkedDataChanges(subject, getUpdates())
            .then(() => {
                clearForm();
                updateLinkedData();
            }),
        subject
    );
    const isDeleted = values[DATE_DELETED_URI];
    const canEdit = editingEnabled && !isDeleted;

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
            <div>
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
                {editable && showEditButtons && (
                    <Button
                        color="default"
                        onClick={() => {
                            clearForm();
                            setEditingEnabled(false);
                        }}
                    >Cancel
                    </Button>
                )}
            </div>
        );
    }

    return (
        <Grid container direction="row">
            <Grid item xs={11}>
                <FormContext.Provider value={{submit: validateAndSubmit}}>
                    <Grid container>
                        <Grid item xs={12}>
                            <LinkedDataEntityForm
                                {...otherProps}
                                id={formId}
                                editable={canEdit}
                                onSubmit={validateAndSubmit}
                                errorMessage={linkedDataError}
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
            </Grid>
            {showEditButtons ? (
                <Grid item xs={1}>
                    {!canEdit && (
                        <IconButton
                            aria-label="Edit"
                            onClick={() => {
                                setEditingEnabled(true);
                            }}
                        ><Edit />
                        </IconButton>
                    )}
                </Grid>
            ) : null}
        </Grid>
    );
};

LinkedDataEntityFormContainer.propTypes = {
    subject: PropTypes.string.isRequired,
    editable: PropTypes.bool,
};


export const LinkedDataEntityFormWithLinkedData = ({subject, isMetaDataEditable, setHasCollectionMetadataUpdates}) => {
    const {properties, values, linkedDataLoading, linkedDataError, updateLinkedData} = useLinkedData(subject);

    return (
        <LinkedDataEntityFormContainer
            subject={subject}
            editable={isMetaDataEditable}
            properties={properties}
            values={values}
            linkedDataLoading={linkedDataLoading}
            linkedDataError={linkedDataError}
            updateLinkedData={updateLinkedData}
            setHasUpdates={setHasCollectionMetadataUpdates}
        />
    );
};

export default LinkedDataEntityFormContainer;
