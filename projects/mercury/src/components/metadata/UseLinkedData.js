import {useContext, useEffect, useCallback} from 'react';
import {useSelector} from 'react-redux';

import LinkedDataContext from './LinkedDataContext';

const useLinkedData = (subject) => {
    const {
        shapesLoading, shapesError, fetchLinkedDataForSubject,
        combineLinkedDataForSubjectSelector, getPropertiesForLinkedData,
        isLinkedDataLoadingSelector, hasLinkedDataErrorForSubjectSelector
    } = useContext(LinkedDataContext);

    // useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
    const updateLinkedData = useCallback(() => {
        fetchLinkedDataForSubject(subject);
    }, [fetchLinkedDataForSubject, subject]);

    useEffect(() => {
        updateLinkedData();
    }, [updateLinkedData]);

    const linkedDataForSubject = useSelector(state => combineLinkedDataForSubjectSelector(state, subject));

    const isLinkedDataLoading = useSelector(state => isLinkedDataLoadingSelector(state, subject));

    const hasLinkedDataErrorForSubject = useSelector(state => hasLinkedDataErrorForSubjectSelector(state, subject));

    return {
        linkedDataLoading: shapesLoading || isLinkedDataLoading,
        linkedDataError: shapesError || (hasLinkedDataErrorForSubject && `Unable to load metadata for ${subject}`) || '',
        linkedDataForSubject,
        updateLinkedData,
        getPropertiesForLinkedData: () => getPropertiesForLinkedData(linkedDataForSubject, subject)
    };
};

export default useLinkedData;
