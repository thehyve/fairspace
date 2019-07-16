import React, {useState, useEffect, useContext} from "react";
import PropTypes from 'prop-types';
import {
    Button, Dialog, DialogActions,
    DialogContent, DialogTitle, Typography
} from "@material-ui/core";

import {generateUuid, getLabel, isValidLinkedDataIdentifier} from "../../../utils/linkeddata/metadataUtils";
import {getFirstPredicateValue} from "../../../utils/linkeddata/jsonLdUtils";
import * as consts from "../../../constants";
import LinkedDataIdentifierField from "./LinkedDataIdentifierField";
import useFormData from '../UseFormData';
import LinkedDataEntityForm from './LinkedDataEntityForm';
import LinkedDataContext from "../LinkedDataContext";

const NewLinkedDataEntityDialog = ({shape, requireIdentifier = true, onClose, onCreate}) => {
    const [formKey, setFormKey] = useState(generateUuid());
    const [localPart, setLocalPart] = useState(requireIdentifier ? generateUuid() : '');
    const [namespace, setNamespace] = useState(null);

    const {getEmptyLinkedData} = useContext(LinkedDataContext);
    const {extendPropertiesWithChanges, onAdd, onChange, onDelete, submitDisabled} = useFormData(formKey);

    useEffect(() => {
        setFormKey(generateUuid());
    }, []);

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

    const createEntity = (e) => {
        if (e) e.stopPropagation();
        onCreate(formKey, shape, getIdentifier());
    };

    const renderDialogContent = () => {
        const form = (
            <LinkedDataEntityForm
                properties={extendPropertiesWithChanges(getEmptyLinkedData(shape))}
                onAdd={onAdd}
                onChange={onChange}
                onDelete={onDelete}
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
                    disabled={!canCreate() || submitDisabled}
                >
                    Create
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
