import {useContext, useState, useEffect, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import LinkedDataContext from './LinkedDataContext';
import {fetchMetadataVocabularyIfNeeded, submitVocabularyChangesFromState} from "./actions/vocabularyActions";
import {fetchMetadataBySubjectIfNeeded, submitMetadataChangesFromState} from "./actions/metadataActions";
import {getCombinedMetadataForSubject, hasMetadataError, isMetadataPending} from "./reducers/cache/jsonLdBySubjectReducers";
import {hasLinkedDataFormUpdates, hasLinkedDataFormValidationErrors} from "./reducers/linkedDataFormReducers";
import {propertiesToShow, partitionErrors} from "./utils/linkeddata/metadataUtils";
import {extendPropertiesWithVocabularyEditingInfo, getSystemProperties, isFixedShape} from "./utils/linkeddata/vocabularyUtils";
import ErrorDialog from "./components/common/ErrorDialog";
import ValidationErrorsDisplay from './components/metadata/common/ValidationErrorsDisplay';
import {isDataSteward} from "./utils/userUtils";
import Config from "./services/Config/Config";

const useLinkedData = (subject) => {
    const dispatch = useDispatch();
    const {
        isMetadataContext, isVocaularyLoading, isMetaVocabularyLoading, hasMetaVocabularyErrorValue,
        hasVocabularyErrorValue, getMetadataForVocabulary, vocabulary, authorizations
    } = useContext(LinkedDataContext);

    const [linkedData, setLinkedData] = useState([]);

    const isMetadataLoading = useSelector(state => isMetadataPending(state, subject));
    const linkedDataLoading = isVocaularyLoading || (isMetadataContext ? isMetadataLoading : isMetaVocabularyLoading);

    const hasFormUpdates = useSelector(state => hasLinkedDataFormUpdates(state, subject));
    const hasFormValidationErrors = useSelector(state => hasLinkedDataFormValidationErrors(state, subject));

    const metadata = useSelector(state => getCombinedMetadataForSubject(state, subject));

    const linkedDataForSubject = isMetadataContext ? metadata : getMetadataForVocabulary(subject);

    const hasMetadataErrorForSubject = useSelector((state) => hasMetadataError(state, subject));
    const getLinkedDataError = () => {
        const hasOtherErrors = hasVocabularyErrorValue || (isMetadataContext ? hasMetadataErrorForSubject : hasMetaVocabularyErrorValue);

        if (isMetadataContext) {
            const hasMetadata = linkedDataForSubject && linkedDataForSubject.length > 0;
            if (!hasMetadata && !linkedDataLoading) {
                return 'No metadata found for this subject';
            }
            if (hasOtherErrors) {
                return 'An error occurred while loading metadata.';
            }
        } else {
            const hasMetadata = linkedDataForSubject && linkedDataForSubject.length > 0;
            if (!hasMetadata && (!linkedDataLoading || hasOtherErrors)) {
                return 'An error occurred while loading vocabulary.';
            }
        }
        return null;
    };
    const linkedDataError = getLinkedDataError();

    const hasEditRight = isMetadataContext || isDataSteward(authorizations, Config.get());

    const getProperties = () => {
        if (isMetadataContext) {
            return propertiesToShow(linkedDataForSubject)
                .map(p => ({
                    ...p,
                    isEditable: hasEditRight && !p.machineOnly
                }));
        }

        const shape = vocabulary.get(subject);

        return extendPropertiesWithVocabularyEditingInfo({
            properties: propertiesToShow(linkedDataForSubject),
            isFixed: isFixedShape(shape),
            systemProperties: getSystemProperties(shape),
            hasEditRight
        });
    };

    const updateLinkedData = useCallback(() => {
        const data = dispatch(isMetadataContext ? fetchMetadataBySubjectIfNeeded(subject) : fetchMetadataVocabularyIfNeeded(subject));
        setLinkedData(data);
    }, [subject, isMetadataContext, dispatch]);

    useEffect(() => {
        updateLinkedData();
    }, [updateLinkedData]);

    const onSubmit = () => {
        dispatch(isMetadataContext ? submitMetadataChangesFromState(subject) : submitVocabularyChangesFromState(subject))
            .then(() => updateLinkedData())
            .catch(e => {
                if (e.details) {
                    ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, subject), e.message);
                } else {
                    ErrorDialog.showError(e, `Error while updating entity.\n${e.message}`);
                }
            });
    };

    return {
        linkedData,
        linkedDataLoading,
        linkedDataError,
        linkedDataForSubject,
        properties: getProperties(),
        onSubmit,
        hasFormUpdates,
        hasFormValidationErrors,
        hasEditRight
    };
};

export default useLinkedData;
