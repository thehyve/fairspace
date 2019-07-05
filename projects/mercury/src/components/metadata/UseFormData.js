import {useContext, useEffect} from "react";
import {useDispatch, useSelector} from 'react-redux';

import {
    getLinkedDataFormUpdates, getLinkedDataFormValidations,
    hasLinkedDataFormUpdates, hasLinkedDataFormValidationErrors
} from "../../reducers/linkedDataFormReducers";
import {
    addLinkedDataValue, deleteLinkedDataValue,
    updateLinkedDataValue, validateLinkedDataProperty,
    initializeLinkedDataForm
} from "../../actions/linkedDataFormActions";
import ErrorDialog from "../common/ErrorDialog";
import ValidationErrorsDisplay from './common/ValidationErrorsDisplay';
import LinkedDataContext from './LinkedDataContext';
import {propertiesToShow, partitionErrors} from "../../utils/linkeddata/metadataUtils";

const useFormData = (formKey) => {
    if (!formKey) {
        throw new Error('Please provide a valid form key.');
    }

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initializeLinkedDataForm(formKey));
    }, [formKey, dispatch]);

    const hasFormUpdates = useSelector(state => hasLinkedDataFormUpdates(state, formKey));

    const hasFormValidationErrors = useSelector(state => hasLinkedDataFormValidationErrors(state, formKey));

    const {submitLinkedDataChanges, hasEditRight} = useContext(LinkedDataContext);

    const onSubmit = () => {
        submitLinkedDataChanges((formKey))
            .catch(e => {
                if (e.details) {
                    ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, formKey), e.message);
                } else {
                    ErrorDialog.showError(e, `Error while updating entity.\n${e.message}`);
                }
            });
    };

    const onAdd = (property, value) => {
        dispatch(addLinkedDataValue(formKey, property, value));
        dispatch(validateLinkedDataProperty(formKey, property));
    };

    const onChange = (property, value, index) => {
        dispatch(updateLinkedDataValue(formKey, property, value, index));
        dispatch(validateLinkedDataProperty(formKey, property));
    };

    const onDelete = (property, index) => {
        dispatch(deleteLinkedDataValue(formKey, property, index));
        dispatch(validateLinkedDataProperty(formKey, property));
    };

    const updates = useSelector(state => getLinkedDataFormUpdates(state, formKey));

    const errors = useSelector(state => getLinkedDataFormValidations(state, formKey));

    const extendPropertiesWithChanges = (properties) => propertiesToShow(properties)
        .filter(p => p.isEditable || p.values.length)
        .map(p => ({
            ...p,
            values: updates[p.key] || p.values,
            errors: errors[p.key]
        }));

    return {
        extendPropertiesWithChanges,
        canSubmit: hasEditRight,
        onSubmit,
        submitDisabled: !hasFormUpdates || hasFormValidationErrors,
        onAdd,
        onChange,
        onDelete,
    };
};

export default useFormData;
