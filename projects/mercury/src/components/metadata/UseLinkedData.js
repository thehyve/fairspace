import {useContext, useEffect, useCallback} from 'react';

import LinkedDataContext from './LinkedDataContext';

const useLinkedData = (subject, isEditable) => {
    if (!subject) {
        throw new Error('Please provide a valid subject.');
    }

    const {
        shapesLoading, shapesError, fetchLinkedDataForSubject,
        getPropertiesForLinkedData, isLinkedDataLoading, hasLinkedDataErrorForSubject,
        combineLinkedDataForSubject, getTypeInfoForLinkedData,
    } = useContext(LinkedDataContext);

    // useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
    const updateLinkedData = useCallback(() => {
        fetchLinkedDataForSubject(subject);
    }, [fetchLinkedDataForSubject, subject]);

    useEffect(() => {
        updateLinkedData();
    }, [updateLinkedData]);

    const linkedDataForSubject = combineLinkedDataForSubject(subject);

    const {label, description} = getTypeInfoForLinkedData(linkedDataForSubject);

    const linkedDataLoading = shapesLoading || isLinkedDataLoading(subject);

    let error = shapesError || (hasLinkedDataErrorForSubject(subject) && `Unable to load metadata for ${subject}`) || '';

    if (!linkedDataLoading && !(linkedDataForSubject && linkedDataForSubject.length > 0)) {
        error = 'No metadata found for this subject';
    }

    return {
        linkedDataLoading,
        linkedDataError: error,
        linkedDataForSubject,
        typeLabel: label,
        typeDescription: description,
        updateLinkedData,
        properties: getPropertiesForLinkedData({linkedData: linkedDataForSubject, subject, isEditable})
    };
};

export default useLinkedData;
