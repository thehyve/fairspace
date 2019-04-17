import * as actionTypes from "./actionTypes";

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
