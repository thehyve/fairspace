import {useEffect, useContext} from "react";
import {useDispatch, useSelector} from 'react-redux';

import useLinkedData from './UseLinkedData';
import {
    getLinkedDataFormUpdates, getLinkedDataFormValidations,
    hasLinkedDataFormUpdates, hasLinkedDataFormValidationErrors
} from "../../reducers/linkedDataFormReducers";
import {
    addLinkedDataValue, deleteLinkedDataValue, initializeLinkedDataForm,
    updateLinkedDataValue, validateLinkedDataProperty
} from "../../actions/linkedDataFormActions";
import ErrorDialog from "../common/ErrorDialog";
import ValidationErrorsDisplay from './common/ValidationErrorsDisplay';
import LinkedDataContext from './LinkedDataContext';
import {propertiesToShow, partitionErrors} from "../../utils/linkeddata/metadataUtils";

const useFormData = ({formKey, shape}) => {
    if (!formKey && !shape) {
        throw new Error('Forms depend on formKey or a shape');
    }

    const {
        linkedDataForSubject, linkedDataLoading, linkedDataError, getPropertiesForLinkedData
    } = useLinkedData(formKey);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initializeLinkedDataForm(formKey));
    }, [formKey, dispatch]);

    const hasFormUpdates = useSelector(state => hasLinkedDataFormUpdates(state, formKey));
    const hasFormValidationErrors = useSelector(state => hasLinkedDataFormValidationErrors(state, formKey));

    const {submitLinkedDataChanges, getEmptyLinkedData, hasEditRight} = useContext(LinkedDataContext);

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

    const getPropertiesWithChanges = () => {
        const propertiesForSubject = getPropertiesForLinkedData(shape);
        const propertiesOrinitalize = (propertiesForSubject && propertiesForSubject.length > 0) ? propertiesForSubject : getEmptyLinkedData(shape);

        return propertiesToShow(propertiesOrinitalize)
            .filter(p => p.isEditable || p.values.length)
            .map(p => ({
                ...p,
                values: updates[p.key] || p.values,
                errors: errors[p.key]
            }));
    };

    let error = linkedDataError;

    if (!shape && !linkedDataLoading && !(linkedDataForSubject && linkedDataForSubject.length > 0)) {
        error = 'No metadata found for this subject';
    }

    return {
        properties: getPropertiesWithChanges(),
        loading: linkedDataLoading,
        error,
        canSubmit: hasEditRight && !linkedDataError,
        onSubmit,
        submitDisabled: !hasFormUpdates || hasFormValidationErrors,
        onAdd,
        onChange,
        onDelete,
    };
};

export default useFormData;
