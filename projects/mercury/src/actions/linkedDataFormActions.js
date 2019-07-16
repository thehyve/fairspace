import * as actionTypes from "./actionTypes";
import {getLinkedDataFormUpdates} from "../reducers/linkedDataFormReducers";
import {validateValuesAgainstShape} from '../utils/validationUtils';

export const addLinkedDataValue = (formKey, property, value) => ({
    type: actionTypes.ADD_LINKEDDATA_VALUE,
    formKey,
    property,
    value
});

export const updateLinkedDataValue = (formKey, property, value, index) => ({
    type: actionTypes.UPDATE_LINKEDDATA_VALUE,
    formKey,
    property,
    value,
    index
});

export const deleteLinkedDataValue = (formKey, property, index) => ({
    type: actionTypes.DELETE_LINKEDDATA_VALUE,
    formKey,
    property,
    index
});

export const initializeLinkedDataForm = (formKey) => ({
    type: actionTypes.INITIALIZE_LINKEDDATA_FORM,
    formKey
});

export const clearLinkedDataForm = (formKey) => ({
    type: actionTypes.CLEAR_LINKEDDATA_FORM,
    formKey
});

export const validateLinkedDataProperty = (formKey, property) => (dispatch, getState) => {
    const formUpdates = getLinkedDataFormUpdates(getState(), formKey);
    const values = formUpdates[property.key];
    const validations = validateValuesAgainstShape({...property, values});

    return dispatch({
        type: actionTypes.VALIDATE_LINKEDDATA_PROPERTY,
        validations,
        formKey,
        property
    });
};
