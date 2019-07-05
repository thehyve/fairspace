import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {fetchMetadataVocabularyIfNeeded, fetchMetaVocabularyIfNeeded, submitVocabularyChangesFromState} from "../../actions/vocabularyActions";
import {fetchMetadataBySubjectIfNeeded, submitMetadataChangesFromState} from "../../actions/metadataActions";
import {
    getVocabulary, hasVocabularyError, isVocabularyPending,
    isMetaVocabularyPending, getMetaVocabulary, hasMetaVocabularyError
} from "../../reducers/cache/vocabularyReducers";
import {getAuthorizations} from "../../reducers/account/authorizationsReducers";
import {fromJsonLd, emptyLinkedData} from "../../utils/linkeddata/jsonLdConverter";
import {getCombinedMetadataForSubject, hasMetadataError, isMetadataPending} from "../../reducers/cache/jsonLdBySubjectReducers";
import {isDataSteward} from "../../utils/userUtils";
import Config from "../../services/Config/Config";
import {propertiesToShow} from "../../utils/linkeddata/metadataUtils";
import {extendPropertiesWithVocabularyEditingInfo, getSystemProperties, isFixedShape} from "../../utils/linkeddata/vocabularyUtils";

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
    const getEmptyLinkedData = (shape) => emptyLinkedData(metaVocabulary, shape);

    const fetchLinkedData = () => dispatch(fetchMetadataVocabularyIfNeeded());

    const isLinkedDataLoadingSelector = isVocabularyPending;

    const hasLinkedDataErrorForSubjectSelector = hasVocabularyError;

    const combineLinkedDataForSubjectSelector = (_, subject) => fromJsonLd(vocabulary.getRaw(), subject, metaVocabulary);

    const submitLinkedDataChanges = (subject) => dispatch(submitVocabularyChangesFromState(subject))
        .then(() => fetchLinkedData());

    const getPropertiesForLinkedData = (linkedData, subject) => {
        const shape = vocabulary.get(subject);

        return extendPropertiesWithVocabularyEditingInfo({
            properties: propertiesToShow(linkedData),
            isFixed: isFixedShape(shape),
            systemProperties: getSystemProperties(shape),
            isEditable: isDataSteward
        });
    };

    return (
        <LinkedDataContext.Provider
            value={{
                shapesLoading,
                shapesError,
                fetchLinkedDataForSubject: fetchLinkedData,
                isLinkedDataLoadingSelector,
                hasLinkedDataErrorForSubjectSelector,
                combineLinkedDataForSubjectSelector,
                getEmptyLinkedData,
                submitLinkedDataChanges,
                getPropertiesForLinkedData,
                hasEditRight: isDataSteward(authorizations, Config.get())
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

    const isLinkedDataLoadingSelector = (state, subject) => isMetadataPending(state, subject);

    const hasLinkedDataErrorForSubjectSelector = (state, subject) => hasMetadataError(state, subject);

    const combineLinkedDataForSubjectSelector = getCombinedMetadataForSubject;

    const submitLinkedDataChanges = (subject) => dispatch(submitMetadataChangesFromState(subject))
        .then(() => fetchLinkedDataForSubject(subject));

    const getPropertiesForLinkedData = (linkedData) => propertiesToShow(linkedData)
        .map(p => ({
            ...p,
            isEditable: !p.machineOnly
        }));

    return (
        <LinkedDataContext.Provider
            value={{
                shapesLoading,
                shapesError,
                fetchLinkedDataForSubject,
                isLinkedDataLoadingSelector,
                hasLinkedDataErrorForSubjectSelector,
                combineLinkedDataForSubjectSelector,
                getEmptyLinkedData,
                submitLinkedDataChanges,
                getPropertiesForLinkedData,
                hasEditRight: true
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};

export default LinkedDataContext;
