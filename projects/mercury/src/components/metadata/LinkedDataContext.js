import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {fetchMetadataVocabularyIfNeeded, fetchMetaVocabularyIfNeeded} from "../../actions/vocabularyActions";
import {
    getVocabulary, hasVocabularyError, isVocabularyPending,
    isMetaVocabularyPending, getMetaVocabulary, hasMetaVocabularyError
} from "../../reducers/cache/vocabularyReducers";
import {getAuthorizations} from "../../reducers/account/authorizationsReducers";
import {fromJsonLd, emptyLinkedData} from "../../utils/linkeddata/jsonLdConverter";
import {getCombinedMetadataForSubject} from "../../reducers/cache/jsonLdBySubjectReducers";
import {isDataSteward} from "../../utils/userUtils";
import Config from "../../services/Config/Config";
import {fetchMetadataBySubjectIfNeeded} from "../../actions/metadataActions";

const LinkedDataContext = React.createContext({});

export const LinkedDataVocabularyProvider = ({children}) => {
    const dispatch = useDispatch();

    dispatch(fetchMetaVocabularyIfNeeded());

    const shapesLoading = useSelector(state => isMetaVocabularyPending(state));

    const hasShapesError = useSelector(state => hasMetaVocabularyError(state));

    const metaVocabulary = useSelector(state => getMetaVocabulary(state));

    const vocabulary = useSelector(state => getVocabulary(state));

    const shapesError = !shapesLoading && hasShapesError && 'An error occurred while loading the vocbulary';

    const authorizations = useSelector(state => getAuthorizations(state));

    const hasEditRight = isDataSteward(authorizations, Config.get());

    const getEmptyLinkedData = (shape) => emptyLinkedData(metaVocabulary, shape);

    const fetchLinkedDataForSubject = () => dispatch(fetchMetadataVocabularyIfNeeded());

    const combineLinkedDataForSubjectSelector = (state, subject) => fromJsonLd(vocabulary.getRaw(), subject, metaVocabulary);

    return (
        <LinkedDataContext.Provider
            value={{
                isMetadataContext: false,
                shapesLoading,
                shapesError,
                fetchLinkedDataForSubject,
                combineLinkedDataForSubjectSelector,
                getEmptyLinkedData,
                hasEditRight,
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};


export const LinkedDataMetadataProvider = ({children}) => {
    const dispatch = useDispatch();

    dispatch(fetchMetadataVocabularyIfNeeded());

    const shapesLoading = useSelector(state => isVocabularyPending(state));

    const vocabulary = useSelector(state => getVocabulary(state));

    const hasShapesError = useSelector(state => hasVocabularyError(state));

    const shapesError = !shapesLoading && hasShapesError && 'An error occurred while loading the metadata';

    const getEmptyLinkedData = (shape) => emptyLinkedData(vocabulary, shape);

    const fetchLinkedDataForSubject = (subject) => dispatch(fetchMetadataBySubjectIfNeeded(subject));

    const combineLinkedDataForSubjectSelector = getCombinedMetadataForSubject;

    return (
        <LinkedDataContext.Provider
            value={{
                isMetadataContext: true,
                shapesLoading,
                shapesError,
                fetchLinkedDataForSubject,
                combineLinkedDataForSubjectSelector,
                getEmptyLinkedData,
                hasEditRight: true,
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};

export default LinkedDataContext;
