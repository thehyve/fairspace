import {useContext, useState, useEffect, useCallback} from 'react';
import {useSelector} from 'react-redux';

import LinkedDataContext from './LinkedDataContext';
import {hasMetadataError, isMetadataPending} from "../../reducers/cache/jsonLdBySubjectReducers";

const useLinkedData = (subject) => {
    const {
        shapesLoading, shapesError, getLinkedDataForSubject, fetchLinkedData, hasEditRight
    } = useContext(LinkedDataContext);

    const [linkedData, setLinkedData] = useState([]);

    const isMetadataLoading = useSelector(state => isMetadataPending(state, subject));

    const linkedDataLoading = shapesLoading || isMetadataLoading;

    const linkedDataForSubject = getLinkedDataForSubject(subject);

    const hasMetadataErrorForSubject = useSelector((state) => hasMetadataError(state, subject));

    // useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
    // Function will not change unless on the given dependencies changes
    const updateLinkedData = useCallback(() => {
        const data = fetchLinkedData(subject);
        setLinkedData(data);
    }, [fetchLinkedData, subject]);

    useEffect(() => {
        updateLinkedData();
    }, [updateLinkedData]);

    return {
        linkedData,
        linkedDataLoading,
        linkedDataError: shapesError || (hasMetadataErrorForSubject && `Unable to load metadata for ${subject}`) || '',
        linkedDataForSubject,
        hasEditRight,
        updateLinkedData
    };
};

export default useLinkedData;
