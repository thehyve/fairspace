import React, {useContext, useState} from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from '@mui/material';

import {generateUuid, getLabel, isValidLinkedDataIdentifier} from './metadataUtils';
import {getFirstPredicateId, getFirstPredicateValue} from './jsonLdUtils';
import * as consts from '../../constants';
import LinkedDataIdentifierField from './LinkedDataIdentifierField';
import useFormData from './UseFormData';
import LinkedDataEntityForm from './LinkedDataEntityForm';
import LinkedDataContext from '../LinkedDataContext';
import useFormSubmission from './UseFormSubmission';
import useNavigationBlocker from '../../common/hooks/UseNavigationBlocker';
import {getPropertiesForNodeShape} from './vocabularyUtils';
import ConfirmationDialog from '../../common/components/ConfirmationDialog';

const NewLinkedDataEntityDialog = ({shape, requireIdentifier = true, onClose, onCreate = () => {}}) => {
    const [localPart, setLocalPart] = useState(requireIdentifier ? generateUuid() : '');
    const [namespace, setNamespace] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const getIdentifier = () => {
        // If no localPart is specified, treat the identifier as not being entered
        // This allows other parts of the system to specify a sensible default in such a case
        if (!localPart) {
            return undefined;
        }

        if (!namespace) {
            return localPart;
        }

        return encodeURI(namespace.value + localPart);
    };

    const {shapes, extendProperties, createLinkedDataEntity} = useContext(LinkedDataContext);
    const properties = getPropertiesForNodeShape(shapes, shape);
    const type = getFirstPredicateId(shape, consts.SHACL_TARGET_CLASS) || shape['@id'];

    // Apply context-specific logic to the properties and filter on visibility
    const extendedProperties = extendProperties({properties, isEntityEditable: true});

    const {addValue, updateValue, deleteValue,
        getUpdates, valuesWithUpdates,
        validateAll, validationErrors, isValid,
        hasFormUpdates, clearForm} = useFormData({}, extendedProperties);
    const {confirmationShown, hideConfirmation, showConfirmation} = useNavigationBlocker(!formSubmitted && hasFormUpdates);

    const {isUpdating, submitForm} = useFormSubmission(
        () => createLinkedDataEntity(getIdentifier(), getUpdates(), type)
            .then(result => {
                clearForm();
                setFormSubmitted(true);
                onCreate(result);
            }),
        getIdentifier()
    );

    const typeLabel = getLabel(shape);

    const createEntity = (event) => {
        if (event) event.stopPropagation();

        const hasErrors = validateAll(extendedProperties);
        if (!hasErrors) submitForm(typeLabel);
    };

    const handleCloseDialog = (e) => {
        if (e) e.stopPropagation();
        if (hasFormUpdates) {
            showConfirmation();
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
                typeIri={type}
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

    const typeDescription = getFirstPredicateValue(shape, consts.SHACL_DESCRIPTION);

    return (
        <>
            <Dialog
                open
                disableEnforceFocus
                onClose={handleCloseDialog}
                aria-labelledby="form-dialog-title"
                fullWidth
                maxWidth="md"
            >
                <DialogTitle id="form-dialog-title">
                    <Typography variant="h5">{typeLabel}</Typography>
                    <Typography variant="subtitle1">{typeDescription}</Typography>
                </DialogTitle>
                <DialogContent style={{overflowX: 'hidden'}}>
                    {renderDialogContent()}
                </DialogContent>
                <DialogActions>
                    <Button
                        data-testid="submit-button"
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
                    <Button onClick={handleCloseDialog} disabled={isUpdating}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            <ConfirmationDialog
                open={confirmationShown}
                title="Close form"
                content="You have unsaved changes, are you sure you want to close the form?"
                agreeButtonText="Close form"
                disagreeButtonText="back to form"
                onAgree={() => onClose()}
                onDisagree={hideConfirmation}
            />
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
