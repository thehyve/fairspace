import React, {useContext, useState, useEffect} from "react";
import PropTypes from 'prop-types';
import {
    Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography
} from "@material-ui/core";
import {ConfirmationDialog} from '@fairspace/shared-frontend';

import {generateUuid, getLabel, isValidLinkedDataIdentifier} from "../../common/utils/linkeddata/metadataUtils";
import {getFirstPredicateId, getFirstPredicateValue} from "../../common/utils/linkeddata/jsonLdUtils";
import * as consts from "../../constants";
import LinkedDataIdentifierField from "./LinkedDataIdentifierField";
import useFormData from '../UseFormData';
import LinkedDataEntityForm from './LinkedDataEntityForm';
import LinkedDataContext from "../LinkedDataContext";
import useFormSubmission from "../UseFormSubmission";
import FormContext from "./FormContext";
import UseNavigationBlocker from "../../common/hooks/UseNavigationBlocker";

const NewLinkedDataEntityDialog = ({shape, requireIdentifier = true, onClose, onCreate = () => {}}) => {
    const [localPart, setLocalPart] = useState(requireIdentifier ? generateUuid() : '');
    const [namespace, setNamespace] = useState(null);

    const getIdentifier = () => {
        // If no localPart is specified, treat the identifier as not being entered
        // This allows other parts of the system to specify a sensible default in such a case
        if (!localPart) {
            return undefined;
        }

        if (!namespace) {
            return localPart;
        }

        return namespace.value + localPart;
    };

    const {shapes, extendProperties, createLinkedDataEntity} = useContext(LinkedDataContext);
    const properties = shapes.getPropertiesForNodeShape(shape);
    const type = getFirstPredicateId(shape, consts.SHACL_TARGET_CLASS);
    // The type could be required for unknown subjects which may not be known by the backend
    const values = {
        '@type': [{
            id: type
        }]
    };

    // Apply context-specific logic to the properties and filter on visibility
    const extendedProperties = extendProperties({properties, isEntityEditable: true});

    const {
        addValue, updateValue, deleteValue,
        getUpdates, valuesWithUpdates,
        validateAll, validationErrors, isValid,
        hasFormUpdates
    } = useFormData(values);
    const {
        showCloseConfirmation, setShowCloseConfirmation
    } = UseNavigationBlocker(hasFormUpdates);

    const {isUpdating, submitForm} = useFormSubmission(
        () => createLinkedDataEntity(getIdentifier(), getUpdates(), type)
            .then(result => {
                onCreate(result);
            }),
        getIdentifier()
    );

    const createEntity = (event) => {
        if (event) event.stopPropagation();

        const hasErrors = validateAll(extendedProperties);
        if (!hasErrors) submitForm();
    };

    const handleCloseDialog = (e) => {
        if (e) e.stopPropagation();
        if (hasFormUpdates) {
            setShowCloseConfirmation(true);
        } else {
            onClose();
        }
    };

    const formId = `entity-form-${getIdentifier()}`;

    const renderDialogContent = () => {
        const form = (
            <LinkedDataEntityForm
                key="form"
                id={formId}
                onSubmit={createEntity}
                properties={extendedProperties}
                values={valuesWithUpdates}
                validationErrors={validationErrors}
                onAdd={addValue}
                onChange={updateValue}
                onDelete={deleteValue}
            />
        );

        const idField = (
            <LinkedDataIdentifierField
                key="identifier"
                namespace={namespace}
                localPart={localPart}
                onLocalPartChange={setLocalPart}
                onNamespaceChange={setNamespace}
                required={requireIdentifier}
            />
        );

        // If the identifier field is not required, it will be inferred from other
        // properties by default. This makes the field quite unimportant, so it will
        // be rendered at the bottom. See VRE-830 for details
        return requireIdentifier ? [idField, form] : [form, idField];
    };

    const canCreate = () => !requireIdentifier || isValidLinkedDataIdentifier(getIdentifier());

    const typeLabel = getLabel(shape);

    const typeDescription = getFirstPredicateValue(shape, consts.SHACL_DESCRIPTION);

    return (
        <>
            <Dialog
                open
                onClose={handleCloseDialog}
                aria-labelledby="form-dialog-title"
                fullWidth
                maxWidth="md"
            >
                <DialogTitle disableTypography id="form-dialog-title">
                    <Typography variant="h5">{typeLabel}</Typography>
                    <Typography variant="subtitle1">{typeDescription}</Typography>
                </DialogTitle>
                <DialogContent style={{overflowX: 'hidden'}}>
                    <FormContext.Provider value={{submit: createEntity}}>
                        {renderDialogContent()}
                    </FormContext.Provider>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDialog}
                        color="secondary"
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={createEntity}
                        color="primary"
                        variant="contained"
                        form={formId}
                        disabled={!canCreate() || isUpdating || !isValid}
                    >
                        {`Create ${typeLabel}`}
                        {isUpdating && <CircularProgress style={{marginLeft: 4}} size={24} />}
                    </Button>
                </DialogActions>
            </Dialog>
            {showCloseConfirmation && (
                <ConfirmationDialog
                    open
                    title="Close form"
                    content="You have unsaved changes, are you sure you want to close the form?"
                    agreeButtonText="Close form"
                    disagreeButtonText="Go back to form"
                    onAgree={() => onClose()}
                    onDisagree={() => setShowCloseConfirmation(false)}
                />
            )}
        </>
    );
};

NewLinkedDataEntityDialog.propTypes = {
    shape: PropTypes.object,
    onCreate: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    requireIdentifier: PropTypes.bool
};

export default NewLinkedDataEntityDialog;
