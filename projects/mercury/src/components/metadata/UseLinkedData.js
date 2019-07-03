import {useContext, useEffect, useCallback} from 'react';
import {useSelector} from 'react-redux';

import LinkedDataContext from './LinkedDataContext';
import {hasMetadataError, isMetadataPending} from "../../reducers/cache/jsonLdBySubjectReducers";

const useLinkedData = (subject) => {
    const {
        shapesLoading, shapesError, fetchLinkedDataForSubject,
        combineLinkedDataForSubjectSelector, hasEditRight
    } = useContext(LinkedDataContext);

    const isMetadataLoading = useSelector(state => isMetadataPending(state, subject));

    const linkedDataLoading = shapesLoading || isMetadataLoading;

    const hasMetadataErrorForSubject = useSelector((state) => hasMetadataError(state, subject));

    const linkedDataForSubject = useSelector(state => combineLinkedDataForSubjectSelector(state, subject));

    // useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
    // Function will not change unless on the given dependencies changes
    const updateLinkedData = useCallback(() => {
        fetchLinkedDataForSubject(subject);
    }, [fetchLinkedDataForSubject, subject]);

    useEffect(() => {
        updateLinkedData();
    }, [updateLinkedData]);

    return {
        linkedDataLoading,
        linkedDataError: shapesError || (hasMetadataErrorForSubject && `Unable to load metadata for ${subject}`) || '',
        linkedDataForSubject,
        hasEditRight,
        updateLinkedData
    };
};

export default useLinkedData;
