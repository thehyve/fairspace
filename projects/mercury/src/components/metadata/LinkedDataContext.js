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

    const fetchShapes = () => dispatch(fetchMetaVocabularyIfNeeded());
    fetchShapes();

    const shapesLoading = useSelector(state => isMetaVocabularyPending(state));

    const hasShapesError = useSelector(state => hasMetaVocabularyError(state));

    const metaVocabulary = useSelector(state => getMetaVocabulary(state));

    const vocabulary = useSelector(state => getVocabulary(state));

    const shapesError = !shapesLoading && hasShapesError && 'An error occurred while loading the vocbulary';

    const authorizations = useSelector(state => getAuthorizations(state));

    const hasEditRight = isDataSteward(authorizations, Config.get());

    const getEmptyLinkedData = (shape) => emptyLinkedData(metaVocabulary, shape);

    const getMetadataForVocabulary = (subject) => fromJsonLd(vocabulary.getRaw(), subject, metaVocabulary);

    const fetchLinkedData = (subject) => dispatch(fetchMetadataVocabularyIfNeeded(subject));

    return (
        <LinkedDataContext.Provider
            value={{
                isMetadataContext: false,
                shapesLoading,
                shapesError,
                getLinkedDataForSubject: getMetadataForVocabulary,
                getEmptyLinkedData,
                hasEditRight,
                fetchLinkedData,
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};


export const LinkedDataMetadataProvider = ({children}) => {
    const dispatch = useDispatch();

    const fetchShapes = () => dispatch(fetchMetadataVocabularyIfNeeded());
    fetchShapes();

    const shapesLoading = useSelector(state => isVocabularyPending(state));

    const vocabulary = useSelector(state => getVocabulary(state));

    const hasShapesError = useSelector(state => hasVocabularyError(state));

    const shapesError = !shapesLoading && hasShapesError && 'An error occurred while loading the metadata';

    const GetLinkedData = (subject) => useSelector(state => getCombinedMetadataForSubject(state, subject));

    const getEmptyLinkedData = (shape) => emptyLinkedData(vocabulary, shape);

    const fetchLinkedData = (subject) => dispatch(fetchMetadataBySubjectIfNeeded(subject));

    return (
        <LinkedDataContext.Provider
            value={{
                isMetadataContext: true,
                shapesLoading,
                shapesError,
                getLinkedDataForSubject: GetLinkedData,
                getEmptyLinkedData,
                hasEditRight: true,
                fetchLinkedData,
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};

export default LinkedDataContext;
