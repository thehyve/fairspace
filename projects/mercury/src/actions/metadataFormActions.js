import * as actionTypes from "./actionTypes";

export const addMetadataValue = (subject, property, value) => ({
    type: actionTypes.ADD_METADATA_VALUE,
    subject,
    property,
    value
});

export const updateMetadataValue = (subject, property, value, index) => ({
    type: actionTypes.UPDATE_METADATA_VALUE,
    subject,
    property,
    value,
    index
});

export const deleteMetadataValue = (subject, property, index) => ({
    type: actionTypes.DELETE_METADATA_VALUE,
    subject,
    property,
    index
});

export const initializeMetadataForm = (subject) => ({
    type: actionTypes.INITIALIZE_METADATA_FORM,
    subject
})
