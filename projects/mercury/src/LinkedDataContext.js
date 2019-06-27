import React from 'react';
import {useDispatch, useStore} from 'react-redux';

import {fetchMetadataVocabularyIfNeeded, fetchMetaVocabularyIfNeeded, submitVocabularyChangesFromState} from "./actions/vocabularyActions";
import {fetchMetadataBySubjectIfNeeded, submitMetadataChangesFromState} from "./actions/metadataActions";
import {getVocabulary, hasVocabularyError, isVocabularyPending, isMetaVocabularyPending, getMetaVocabulary, hasMetaVocabularyError} from "./reducers/cache/vocabularyReducers";
import {getCombinedMetadataForSubject, hasMetadataError, isMetadataPending} from "./reducers/cache/jsonLdBySubjectReducers";
import {url2iri, propertiesToShow, partitionErrors} from "./utils/linkeddata/metadataUtils";
import {fromJsonLd} from "./utils/linkeddata/jsonLdConverter";
import {getAuthorizations} from "./reducers/account/authorizationsReducers";
import {isDataSteward} from "./utils/userUtils";
import Config from "./services/Config/Config";
import {hasLinkedDataFormUpdates, hasLinkedDataFormValidationErrors} from "./reducers/linkedDataFormReducers";
import {extendPropertiesWithVocabularyEditingInfo, getSystemProperties, isFixedShape} from "./utils/linkeddata/vocabularyUtils";
import ErrorDialog from "./components/common/ErrorDialog";
import ValidationErrorsDisplay from './components/metadata/common/ValidationErrorsDisplay';

const LinkedDataContext = React.createContext({});

export const METADATA_CONTEXT = 'METADATA_CONTEXT';
export const VOCABULARY_CONTEXT = 'VOCABULARY_CONTEXT';

export const LinkedDataProvider = ({children, context, subject = url2iri(window.location.href), isEditable = true}) => {
    const isMetadataContext = context === METADATA_CONTEXT;
    const isVocabularyContext = context === VOCABULARY_CONTEXT;

    if (!isMetadataContext && !isVocabularyContext) {
        throw new Error('Please provide a valid linked data context');
    }

    const dispatch = useDispatch();

    const fetchShapes = () => dispatch(isMetadataContext ? fetchMetadataVocabularyIfNeeded() : fetchMetaVocabularyIfNeeded());
    const fetchLinkedData = (sub = subject) => dispatch(isMetadataContext ? fetchMetadataBySubjectIfNeeded(sub) : fetchMetadataVocabularyIfNeeded(sub));

    fetchShapes();

    const state = useStore().getState();

    const isMetadataLoading = (sub) => isMetadataPending(state, sub || subject);
    const isVocaularyLoading = isVocabularyPending(state);
    const isMetaVocabularyLoading = isMetaVocabularyPending(state);
    const isLinkedDataLoading = (sub) => isVocaularyLoading || (isMetadataContext ? isMetadataLoading(sub || subject) : isMetaVocabularyLoading);

    const vocabulary = getVocabulary(state);
    const metaVocabulary = getMetaVocabulary(state);

    const hasVocabularyErrorValue = hasVocabularyError(state);
    const hasMetaVocabularyErrorValue = hasMetaVocabularyError(state);

    const authorizations = getAuthorizations(state);

    const hasFormUpdates = (sub) => hasLinkedDataFormUpdates(state, sub || subject);
    const hasFormValidationErrorsValue = (sub) => hasLinkedDataFormValidationErrors(state, sub || subject);
    const hasMetadataErrorValue = (sub) => hasMetadataError(state, sub || subject);
    const hasOtherErrors = (sub) => hasVocabularyErrorValue || (isMetadataContext ? hasMetadataErrorValue(sub) : hasMetaVocabularyErrorValue);

    const isEditableValue = isMetadataContext ? isEditable : isDataSteward(authorizations, Config.get());

    const getMetadata = (sub) => getCombinedMetadataForSubject(state, sub || subject);

    const getMetadataForVocbulary = (sub) => fromJsonLd(vocabulary.getRaw(), sub || subject, metaVocabulary);

    const getProperties = (sub = subject) => {
        if (isMetadataContext) {
            return propertiesToShow(getMetadata(sub))
                .map(p => ({
                    ...p,
                    isEditable: isEditable && !p.machineOnly
                }));
        }

        const metadata = getMetadataForVocbulary(sub);
        const shape = vocabulary.get(sub);

        return extendPropertiesWithVocabularyEditingInfo({
            properties: propertiesToShow(metadata),
            isFixed: isFixedShape(shape),
            systemProperties: getSystemProperties(shape),
            isEditable
        });
    };

    const getLinkedDataError = (sub) => {
        if (isMetadataContext) {
            const metadata = getMetadata(sub);
            const hasMetadata = metadata && metadata.length > 0;
            if (!hasMetadata && !isLinkedDataLoading(sub)) {
                return 'No metadata found for this subject';
            }
            if (hasOtherErrors(sub)) {
                return 'An error occurred while loading metadata.';
            }
        } else {
            const metadata = getMetadataForVocbulary(sub);
            const hasMetadata = metadata && metadata.length > 0;
            if ((!hasMetadata && !isLinkedDataLoading(sub)) || hasOtherErrors(sub)) {
                return 'An error occurred while loading vocabulary.';
            }
        }
        return '';
    };

    const handleSubmit = (sub = subject) => dispatch(isMetadataContext ? submitMetadataChangesFromState(sub) : submitVocabularyChangesFromState(sub))
        .then(() => fetchLinkedData(sub));


    const onSubmit = (sub) => {
        handleSubmit(sub)
            .catch(e => {
                if (e.details) {
                    ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, subject), e.message);
                } else {
                    ErrorDialog.showError(e, `Error while updating entity.\n${e.message}`);
                }
            });
    };

    return (
        <LinkedDataContext.Provider
            value={{
                isLinkedDataLoading,
                getProperties,
                getLinkedDataError,
                isEditable: isEditableValue,
                hasLinkedDataFormUpdates: hasFormUpdates,
                hasLinkedDataFormValidationErrors: hasFormValidationErrorsValue,
                fetchShapes,
                fetchLinkedData,
                onSubmit
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};

export default LinkedDataContext;
