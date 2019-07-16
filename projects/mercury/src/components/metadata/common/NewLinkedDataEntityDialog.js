import React, {useContext, useState} from "react";
import PropTypes from 'prop-types';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, CircularProgress} from "@material-ui/core";

import {
    generateUuid, getLabel, getValuesFromProperties, isValidLinkedDataIdentifier
} from "../../../utils/linkeddata/metadataUtils";
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

    const {getEmptyLinkedData} = useContext(LinkedDataContext);

    const visibleProperties = getEmptyLinkedData(shape).filter(p => p.isEditable || p.values.length);
    const values = getValuesFromProperties(visibleProperties);
    const type = getFirstPredicateId(shape, consts.SHACL_TARGET_CLASS);

    const {
        addValue, updateValue, deleteValue,
        updates, valuesWithUpdates
    } = useFormData(values);

    const closeDialog = (e) => {
        if (e) e.stopPropagation();
        onClose();
    };

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

    const {createLinkedDataEntity} = useContext(LinkedDataContext);

    const {isUpdating, submitForm} = useFormSubmission(
        () => createLinkedDataEntity(getIdentifier(), updates, type)
            .then(result => {
                onCreate(result);
            }),
        getIdentifier()
    );


    const createEntity = (event) => {
        if (event) event.stopPropagation();

        submitForm();
    };

    const renderDialogContent = () => {
        const form = (
            <LinkedDataEntityForm
                properties={visibleProperties}
                values={valuesWithUpdates}
                onAdd={addValue}
                onChange={updateValue}
                onDelete={deleteValue}
                key="form"
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
            maxWidth="sm"
        >
            <DialogTitle id="form-dialog-title">
                New entity: {typeLabel}
                <Typography variant="body2">{typeDescription}</Typography>
            </DialogTitle>

            <DialogContent style={{overflowX: 'hidden'}}>
                {renderDialogContent()}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={closeDialog}
                    color="secondary"
                >
                    Cancel
                </Button>
                <Button
                    onClick={createEntity}
                    color="primary"
                    disabled={!canCreate() || isUpdating}
                >
                    {isUpdating ? <CircularProgress /> : 'Create' }
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
