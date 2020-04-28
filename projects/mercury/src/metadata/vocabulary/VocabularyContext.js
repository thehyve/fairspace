import React from 'react';

import {VocabularyAPI} from '../common/LinkedDataAPI';
import {getFirstPredicateProperty} from '../common/jsonLdUtils';
import {SHACL_NAMESPACE, SHACL_PATH, SHACL_TARGET_CLASS} from '../../constants';
import useAsync from "../../common/hooks/UseAsync";

const VocabularyContext = React.createContext();

export const VocabularyProvider = ({children}) => {
    const {data: vocabulary = [], loading: vocabularyLoading, error: vocabularyError, refresh: fetchVocabulary} = useAsync(() => VocabularyAPI.get());

    const submitVocabularyChanges = (subject, values, metaVocabulary) => VocabularyAPI.updateEntity(subject, values, metaVocabulary);

    const createVocabularyEntity = (providedSubject, values, metaVocabulary, type) => {
        // Infer subject from sh:targetClass or sh:path if no explicit subject is given
        const subject = providedSubject
            || getFirstPredicateProperty(values, SHACL_PATH, 'id')
            || getFirstPredicateProperty(values, SHACL_TARGET_CLASS, 'id')
            || getFirstPredicateProperty(values, SHACL_NAMESPACE, 'id');

        if (!subject) {
            throw new Error("Invalid metadata identifier given");
        }

        return VocabularyAPI.get({subject})
            .then((meta) => {
                if (meta.length) {
                    throw Error(`Vocabulary entity already exists: ${subject}`);
                }
            })
            .then(() => VocabularyAPI.updateEntity(subject, values, metaVocabulary, type))
            .then(fetchVocabulary)
            .then(() => ({subject, type, values}));
    };

    const deleteVocabularyEntity = (subject) => VocabularyAPI.delete(subject);

    return (
        <VocabularyContext.Provider
            value={{
                vocabulary,
                vocabularyLoading,
                vocabularyError,
                submitVocabularyChanges,
                createVocabularyEntity,
                deleteVocabularyEntity,
                fetchVocabulary,
            }}
        >
            {children}
        </VocabularyContext.Provider>
    );
};

export default VocabularyContext;
