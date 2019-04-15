import * as actionTypes from "./actionTypes";

export const addMetadataValue = (formKey, property, value) => ({
    type: actionTypes.ADD_METADATA_VALUE,
    formKey,
    property,
    value
});

export const updateMetadataValue = (formKey, property, value, index) => ({
    type: actionTypes.UPDATE_METADATA_VALUE,
    formKey,
    property,
    value,
    index
});

export const deleteMetadataValue = (formKey, property, index) => ({
    type: actionTypes.DELETE_METADATA_VALUE,
    formKey,
    property,
    index
});

export const initializeMetadataForm = (formKey, subject) => ({
    type: actionTypes.INITIALIZE_METADATA_FORM,
    formKey,
    subject
});

export const setSubjectForMetadataForm = (formKey, subject) => ({
    type: actionTypes.SET_SUBJECT_FOR_METADATA_FORM,
    formKey,
    subject
});
