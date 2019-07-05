import {useContext, useEffect, useCallback} from 'react';

import LinkedDataContext from './LinkedDataContext';

const useLinkedData = (subject) => {
    const {
        shapesLoading, shapesError, fetchLinkedDataForSubject,
        getPropertiesForLinkedData,
        isLinkedDataLoading,
        hasLinkedDataErrorForSubject,
        combineLinkedDataForSubject,
    } = useContext(LinkedDataContext);

    // useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
    const updateLinkedData = useCallback(() => {
        fetchLinkedDataForSubject(subject);
    }, [fetchLinkedDataForSubject, subject]);

    useEffect(() => {
        updateLinkedData();
    }, [updateLinkedData]);

    const linkedDataForSubject = combineLinkedDataForSubject(subject);

    return {
        linkedDataLoading: shapesLoading || isLinkedDataLoading(subject),
        linkedDataError: shapesError || (hasLinkedDataErrorForSubject(subject) && `Unable to load metadata for ${subject}`) || '',
        linkedDataForSubject,
        updateLinkedData,
        getPropertiesForLinkedData: () => getPropertiesForLinkedData(linkedDataForSubject, subject)
    };
};

export default useLinkedData;
