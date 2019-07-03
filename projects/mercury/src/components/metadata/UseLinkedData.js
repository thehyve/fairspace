import {useContext, useEffect, useCallback} from 'react';
import {useSelector} from 'react-redux';

import LinkedDataContext from './LinkedDataContext';
import {hasMetadataError, isMetadataPending} from "../../reducers/cache/jsonLdBySubjectReducers";

const useLinkedData = (subject) => {
    const {
        shapesLoading, shapesError, fetchLinkedDataForSubject,
        combineLinkedDataForSubjectSelector, getPropertiesForLinkedData
    } = useContext(LinkedDataContext);

    const isMetadataLoading = useSelector(state => isMetadataPending(state, subject));

    const hasMetadataErrorForSubject = useSelector((state) => hasMetadataError(state, subject));

    const linkedDataForSubject = useSelector(state => combineLinkedDataForSubjectSelector(state, subject));

    // useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
    const updateLinkedData = useCallback(() => {
        fetchLinkedDataForSubject(subject);
    }, [fetchLinkedDataForSubject, subject]);

    useEffect(() => {
        updateLinkedData();
    }, [updateLinkedData]);

    const linkedDataLoading = shapesLoading || isMetadataLoading;

    return {
        linkedDataLoading,
        linkedDataError: shapesError || (hasMetadataErrorForSubject && `Unable to load metadata for ${subject}`) || '',
        linkedDataForSubject,
        updateLinkedData,
        getPropertiesForLinkedData: (shape) => getPropertiesForLinkedData(linkedDataForSubject, shape)
    };
};

export default useLinkedData;
