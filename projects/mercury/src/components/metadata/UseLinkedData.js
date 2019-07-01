import {useContext, useState, useEffect, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import LinkedDataContext from './LinkedDataContext';
import {fetchMetadataVocabularyIfNeeded} from "../../actions/vocabularyActions";
import {fetchMetadataBySubjectIfNeeded} from "../../actions/metadataActions";
import {getCombinedMetadataForSubject, hasMetadataError, isMetadataPending} from "../../reducers/cache/jsonLdBySubjectReducers";
import {isDataSteward} from "../../utils/userUtils";
import Config from "../../services/Config/Config";

const useLinkedData = (subject) => {
    const {
        isMetadataContext, isVocaularyLoading, isMetaVocabularyLoading, hasMetaVocabularyErrorValue,
        hasVocabularyErrorValue, getMetadataForVocabulary, authorizations
    } = useContext(LinkedDataContext);

    const [linkedData, setLinkedData] = useState([]);

    const isMetadataLoading = useSelector(state => isMetadataPending(state, subject));
    const linkedDataLoading = isVocaularyLoading || (isMetadataContext ? isMetadataLoading : isMetaVocabularyLoading);

    const metadata = useSelector(state => getCombinedMetadataForSubject(state, subject));

    const linkedDataForSubject = isMetadataContext ? metadata : getMetadataForVocabulary(subject);

    const hasMetadataErrorForSubject = useSelector((state) => hasMetadataError(state, subject));

    const getLinkedDataError = () => {
        const hasErrors = hasVocabularyErrorValue || (isMetadataContext ? hasMetadataErrorForSubject : hasMetaVocabularyErrorValue);

        if (!linkedDataLoading && hasErrors) {
            return `An error occurred while loading ${isMetadataContext ? 'metadata' : 'vocabulary'}.`;
        }

        return null;
    };
    const linkedDataError = getLinkedDataError();

    const hasEditRight = isMetadataContext || isDataSteward(authorizations, Config.get());

    const dispatch = useDispatch();

    // useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
    // Function will not change unless on the given dependencies changes
    const updateLinkedData = useCallback(() => {
        const data = dispatch(isMetadataContext ? fetchMetadataBySubjectIfNeeded(subject) : fetchMetadataVocabularyIfNeeded(subject));
        setLinkedData(data);
    }, [subject, isMetadataContext, dispatch]);

    useEffect(() => {
        updateLinkedData();
    }, [updateLinkedData]);

    return {
        linkedData,
        linkedDataLoading,
        linkedDataError,
        linkedDataForSubject,
        hasEditRight,
        updateLinkedData
    };
};

export default useLinkedData;
