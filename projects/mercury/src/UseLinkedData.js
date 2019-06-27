import {useContext, useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import LinkedDataContext from './LinkedDataContext';
import {fetchMetadataVocabularyIfNeeded, submitVocabularyChangesFromState} from "./actions/vocabularyActions";
import {fetchMetadataBySubjectIfNeeded, submitMetadataChangesFromState} from "./actions/metadataActions";
import {getCombinedMetadataForSubject, hasMetadataError, isMetadataPending} from "./reducers/cache/jsonLdBySubjectReducers";
import {hasLinkedDataFormUpdates, hasLinkedDataFormValidationErrors} from "./reducers/linkedDataFormReducers";
import {fromJsonLd} from "./utils/linkeddata/jsonLdConverter";
import {propertiesToShow, partitionErrors} from "./utils/linkeddata/metadataUtils";
import {extendPropertiesWithVocabularyEditingInfo, getSystemProperties, isFixedShape} from "./utils/linkeddata/vocabularyUtils";
import ErrorDialog from "./components/common/ErrorDialog";
import ValidationErrorsDisplay from './components/metadata/common/ValidationErrorsDisplay';
import {isDataSteward} from "./utils/userUtils";
import Config from "./services/Config/Config";

const useLinkedData = (subject) => {
    const [linkedData, setLinkedData] = useState([]);

    const dispatch = useDispatch();

    const {
        isMetadataContext, isVocaularyLoading, isMetaVocabularyLoading, hasMetaVocabularyErrorValue,
        hasVocabularyErrorValue, metaVocabulary, vocabulary, authorizations
    } = useContext(LinkedDataContext);

    const isMetadataLoading = useSelector(state => isMetadataPending(state, subject));
    const linkedDataLoading = isVocaularyLoading || (isMetadataContext ? isMetadataLoading : isMetaVocabularyLoading);

    const hasFormUpdates = useSelector(state => hasLinkedDataFormUpdates(state, subject));
    const hasFormValidationErrors = useSelector(state => hasLinkedDataFormValidationErrors(state, subject));

    const metadata = useSelector(state => getCombinedMetadataForSubject(state, subject));
    // getMetadataForVocab from Context (using function call)
    const metadataForVocabulary = fromJsonLd(vocabulary.getRaw(), subject, metaVocabulary);
    const linkedDataForSubject = isMetadataContext ? metadata : metadataForVocabulary;

    const hasMetadataErrorValue = useSelector((state) => hasMetadataError(state, subject));
    const getLinkedDataError = () => {
        const hasOtherErrors = hasVocabularyErrorValue || (isMetadataContext ? hasMetadataErrorValue : hasMetaVocabularyErrorValue);

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
        return '';
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

    const properties = getProperties();

    const fetchLinkedData = () => dispatch(isMetadataContext ? fetchMetadataBySubjectIfNeeded(subject) : fetchMetadataVocabularyIfNeeded(subject));

    useEffect(() => {
        const data = fetchLinkedData();
        setLinkedData(data);
    }, []);


    const handleSubmit = () => dispatch(isMetadataContext ? submitMetadataChangesFromState(subject) : submitVocabularyChangesFromState(subject))
        .then(() => fetchLinkedData());

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

    return {
        linkedData,
        linkedDataLoading,
        linkedDataError,
        linkedDataForSubject,
        properties,
        onSubmit,
        hasFormUpdates,
        hasFormValidationErrors,
        hasEditRight
    };
};

export default useLinkedData;
