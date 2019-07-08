import React, {useState, useEffect} from "react"; import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@material-ui/core";

import {generateUuid, getLabel, isValidLinkedDataIdentifier} from "../../../utils/linkeddata/metadataUtils";
import {getFirstPredicateValue} from "../../../utils/linkeddata/jsonLdUtils";
import * as consts from "../../../constants";
import LinkedDataIdentifierField from "./LinkedDataIdentifierField";
import useNewEntity from '../UseNewEntity';
import useFormData from '../UseFormData';
import LinkedDataEntityForm from './LinkedDataEntityForm';

const NewLinkedDataEntityDialog = ({open, shape, requireIdentifier = true, onClose, onCreate}) => {
    const [formKey, setFormKey] = useState(generateUuid());
    const [localPart, setLocalPart] = useState(requireIdentifier ? generateUuid() : '');
    const [namespace, setNamespace] = useState(null);

    const {properties} = useNewEntity(formKey, shape);
    const {extendPropertiesWithChanges, onAdd, onChange, onDelete, submitDisabled} = useFormData(formKey);

    useEffect(() => {
        setFormKey(generateUuid());
    }, [open]);

    const closeDialog = (e) => {
        if (e) e.stopPropagation();
        onClose();
    };

    const getIdentifier = () => (namespace ? namespace.value + localPart : localPart);

    const createEntity = (e) => {
        if (e) e.stopPropagation();
        onCreate(formKey, shape, getIdentifier());
    };

    const renderDialogContent = () => {
        const form = (
            <LinkedDataEntityForm
                properties={extendPropertiesWithChanges(properties)}
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
            open={open}
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

const mapStateToProps = (state) => ({
    storeState: state,
});

export default connect(mapStateToProps)(NewLinkedDataEntityDialog);
