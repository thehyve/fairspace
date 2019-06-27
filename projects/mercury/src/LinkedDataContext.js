import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {fetchMetadataVocabularyIfNeeded, fetchMetaVocabularyIfNeeded} from "./actions/vocabularyActions";
import {getVocabulary, hasVocabularyError, isVocabularyPending, isMetaVocabularyPending, getMetaVocabulary, hasMetaVocabularyError} from "./reducers/cache/vocabularyReducers";
import {getAuthorizations} from "./reducers/account/authorizationsReducers";

const LinkedDataContext = React.createContext({});

export const METADATA_CONTEXT = 'METADATA_CONTEXT';
export const VOCABULARY_CONTEXT = 'VOCABULARY_CONTEXT';

export const LinkedDataProvider = ({children, context}) => {
    const isMetadataContext = context === METADATA_CONTEXT;
    const isVocabularyContext = context === VOCABULARY_CONTEXT;

    if (!isMetadataContext && !isVocabularyContext) {
        throw new Error('Please provide a valid linked data context');
    }

    const dispatch = useDispatch();

    const fetchShapes = () => dispatch(isMetadataContext ? fetchMetadataVocabularyIfNeeded() : fetchMetaVocabularyIfNeeded());
    fetchShapes();

    const isVocaularyLoading = useSelector(state => isVocabularyPending(state));
    const isMetaVocabularyLoading = useSelector(state => isMetaVocabularyPending(state));

    const vocabulary = useSelector(state => getVocabulary(state));
    const metaVocabulary = useSelector(state => getMetaVocabulary(state));

    const hasVocabularyErrorValue = useSelector(state => hasVocabularyError(state));
    const hasMetaVocabularyErrorValue = useSelector(state => hasMetaVocabularyError(state));

    const authorizations = useSelector(state => getAuthorizations(state));

    return (
        <LinkedDataContext.Provider
            value={{
                isMetadataContext,
                isVocaularyLoading,
                isMetaVocabularyLoading,
                vocabulary,
                metaVocabulary,
                hasVocabularyErrorValue,
                hasMetaVocabularyErrorValue,
                authorizations,
                fetchShapes,
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};

export default LinkedDataContext;
