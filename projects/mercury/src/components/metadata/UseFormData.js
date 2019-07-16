import {useEffect, useState} from "react";
import {useDispatch, useSelector} from 'react-redux';

import {getLinkedDataFormUpdates, hasLinkedDataFormUpdates} from "../../reducers/linkedDataFormReducers";
import {
    addLinkedDataValue, clearLinkedDataForm, deleteLinkedDataValue, initializeLinkedDataForm, updateLinkedDataValue,
    validateLinkedDataProperty
} from "../../actions/linkedDataFormActions";
import {generateUuid} from "../../utils/linkeddata/metadataUtils";

/**
 * This hook is concerned about storing form state for linked data
 * @param values
 * @returns {{valuesWithUpdates: any, updateValue: updateValue, hasFormUpdates: any, deleteValue: deleteValue, updates: any, addValue: addValue}}
 */
const useFormData = (values) => {
    const [formKey] = useState(generateUuid());
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initializeLinkedDataForm(formKey));
    }, [formKey, dispatch]);

    const hasFormUpdates = useSelector(state => hasLinkedDataFormUpdates(state, formKey));

    const addValue = (property, value) => {
        dispatch(addLinkedDataValue(formKey, property, value));
    };

    const updateValue = (property, value, index) => {
        dispatch(updateLinkedDataValue(formKey, property, value, index));
        dispatch(validateLinkedDataProperty(formKey, property));
    };

    const deleteValue = (property, index) => {
        dispatch(deleteLinkedDataValue(formKey, property, index));
        dispatch(validateLinkedDataProperty(formKey, property));
    };

    const clearForm = () => dispatch(clearLinkedDataForm(formKey));

    const updates = useSelector(state => getLinkedDataFormUpdates(state, formKey));
    const valuesWithUpdates = {...values, ...updates};

    return {
        addValue,
        updateValue,
        deleteValue,

        hasFormUpdates,
        updates,
        valuesWithUpdates,
        clearForm
    };
};

export default useFormData;
