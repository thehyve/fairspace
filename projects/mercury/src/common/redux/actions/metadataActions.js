import {MetadataAPI} from "../../../metadata/LinkedDataAPI";
import * as actionTypes from "./actionTypes";
import {getFirstPredicateValue} from "../../utils/linkeddata/jsonLdUtils";

export const submitMetadataChanges = (subject, values, vocabulary) => ({
    type: actionTypes.UPDATE_METADATA,
    payload: MetadataAPI.get({subject})
        .then(meta => (meta.length && getFirstPredicateValue(meta[0], '@type')))
        .then(type => MetadataAPI.updateEntity(subject, values, vocabulary, type)),
    meta: {
        subject
    }
});

export const createMetadataEntity = (subject, values, vocabulary, type) => ({
    type: actionTypes.UPDATE_METADATA,
    payload: MetadataAPI.get({subject})
        .then((meta) => {
            if (meta.length) {
                throw Error(`Entity already exists: ${subject}`);
            }
        })
        .then(() => MetadataAPI.updateEntity(subject, values, vocabulary, type))
        .then(() => ({subject, type, values})),
    meta: {
        subject,
        type
    }
});

export const deleteMetadataEntity = (subject) => ({
    type: actionTypes.DELETE_METADATA,
    payload: MetadataAPI.delete(subject),
    meta: {
        subject
    }
});
