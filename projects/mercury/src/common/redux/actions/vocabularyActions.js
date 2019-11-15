import {VocabularyAPI} from "../../../metadata/LinkedDataAPI";
import * as actionTypes from "./actionTypes";
import {SHACL_NAMESPACE, SHACL_PATH, SHACL_TARGET_CLASS} from "../../../constants";
import {getFirstPredicateProperty} from "../../utils/linkeddata/jsonLdUtils";

export const submitVocabularyChanges = (subject, values, metaVocabulary) => ({
    type: actionTypes.UPDATE_VOCABULARY,
    payload: VocabularyAPI.updateEntity(subject, values, metaVocabulary),
    meta: {
        subject
    }
});

export const createVocabularyEntity = (providedSubject, values, metaVocabulary, type) => {
    // Infer subject from sh:targetClass or sh:path if no explicit subject is given
    const subject = providedSubject
        || getFirstPredicateProperty(values, SHACL_PATH, 'id')
        || getFirstPredicateProperty(values, SHACL_TARGET_CLASS, 'id')
        || getFirstPredicateProperty(values, SHACL_NAMESPACE, 'id');

    if (!subject) {
        throw new Error("Invalid metadata identifier given");
    }

    return {
        type: actionTypes.UPDATE_VOCABULARY,
        payload: VocabularyAPI.get({subject})
            .then((meta) => {
                if (meta.length) {
                    throw Error(`Vocabulary entity already exists: ${subject}`);
                }
            })
            .then(() => VocabularyAPI.updateEntity(subject, values, metaVocabulary, type))
            .then(() => ({subject, type, values})),
        meta: {
            subject,
            type
        }
    };
};

export const deleteVocabularyEntity = (subject) => ({
    type: actionTypes.DELETE_VOCABULARY,
    payload: VocabularyAPI.delete(subject),
    meta: {
        subject
    }
});
