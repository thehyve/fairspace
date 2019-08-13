import React, {useContext, useEffect, useState} from "react";
import PropTypes from 'prop-types';
import {
    Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography
} from "@material-ui/core";

import {generateUuid, getLabel, isValidLinkedDataIdentifier} from "../../../utils/linkeddata/metadataUtils";
import {getFirstPredicateId, getFirstPredicateValue} from "../../../utils/linkeddata/jsonLdUtils";
import * as consts from "../../../constants";
import LinkedDataIdentifierField from "./LinkedDataIdentifierField";
import useFormData from '../UseFormData';
import LinkedDataEntityForm from './LinkedDataEntityForm';
import LinkedDataContext from "../LinkedDataContext";
import useFormSubmission from "../useFormSubmission";

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

    // Apply context-specific logic to the properties and filter on visibility
    const extendedProperties = extendProperties({properties, isEntityEditable: true});

    const {
        addValue, updateValue, deleteValue,
        updates, valuesWithUpdates,

        validateAll, validationErrors, isValid
    } = useFormData();

    // Store the type to create in the form to ensure it is known
    // and will be stored
    useEffect(() => {
        addValue('@type', type);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const {isUpdating, submitForm} = useFormSubmission(
        () => createLinkedDataEntity(getIdentifier(), updates, type)
            .then(result => {
                onCreate(result);
            }),
        getIdentifier()
    );

    const createEntity = () => {
        const hasErrors = validateAll(extendedProperties);
        if (!hasErrors) submitForm();
    };

    const closeDialog = (e) => {
        if (e) e.stopPropagation();
        onClose();
    };

    const renderDialogContent = () => {
        const form = (
            <LinkedDataEntityForm
                properties={extendedProperties}
                values={valuesWithUpdates}
                validationErrors={validationErrors}
                onAdd={addValue}
                onChange={updateValue}
                onDelete={deleteValue}
                key="form"
                onMultiLineCtrlEnter={() => {
                    createEntity();
                }}
            />
        );

        const idField = (
            <LinkedDataIdentifierField
                namespace={namespace}
                localPart={localPart}
                onLocalPartChange={setLocalPart}
                onNamespaceChange={setNamespace}
                required={requireIdentifier}
                key="identifier"
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
        <Dialog
            open
            onClose={closeDialog}
            aria-labelledby="form-dialog-title"
            fullWidth
            maxWidth="md"
        >
            <DialogTitle disableTypography id="form-dialog-title">
                <Typography variant="h5">{typeLabel}</Typography>
                <Typography variant="subtitle1">{typeDescription}</Typography>
            </DialogTitle>

            <DialogContent style={{overflowX: 'hidden'}}>
                <form
                    id={`entity-form-${getIdentifier()}`}
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        createEntity();
                    }}
                    noValidate
                >
                    {renderDialogContent()}
                </form>
            </DialogContent>
            <DialogActions>
                <Button
                    color="secondary"
                    onClick={closeDialog}
                    type="button"
                    disabled={isUpdating}
                >
                    Cancel
                </Button>
                <Button
                    color="primary"
                    variant="contained"
                    type="submit"
                    disabled={!canCreate() || isUpdating || !isValid}
                    form={`entity-form-${getIdentifier()}`}
                >
                    {`Create ${typeLabel}`}
                    {isUpdating && <CircularProgress style={{marginLeft: 4}} size={24} />}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

NewLinkedDataEntityDialog.propTypes = {
    shape: PropTypes.object,
    onCreate: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    requireIdentifier: PropTypes.bool
};

export default NewLinkedDataEntityDialog;
