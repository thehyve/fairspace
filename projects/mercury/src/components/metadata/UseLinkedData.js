import {useContext, useEffect, useCallback} from 'react';

import LinkedDataContext from './LinkedDataContext';

/**
 * This custom hook is a helper for many Linked Data functions, such as fetching, searching and transforming/parsing metadata.
 * It is agnostic about the difference between metadata, vocabular and metavocabulary.
 * The contextual logic is being provided by {@link LinkedDataContext}
 *
 * @param {string} subject
 * @param {boolean} isEntityEditable
 */
const useLinkedData = (subject, fallbackType, isEntityEditable) => {
    if (!subject) {
        throw new Error('Please provide a valid subject.');
    }

    const {
        shapesLoading, shapesError, fetchLinkedDataForSubject,
        getPropertiesForLinkedData, isLinkedDataLoading, hasLinkedDataErrorForSubject,
        combineLinkedDataForSubject, getTypeInfoForLinkedData
    } = useContext(LinkedDataContext);

    // useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
    const updateLinkedData = useCallback(() => {
        fetchLinkedDataForSubject(subject);
    }, [fetchLinkedDataForSubject, subject]);

    useEffect(() => {
        updateLinkedData();
    }, [updateLinkedData]);

    const linkedDataForSubject = combineLinkedDataForSubject(subject, fallbackType);

    const {label, description} = getTypeInfoForLinkedData(linkedDataForSubject);

    const linkedDataLoading = shapesLoading || isLinkedDataLoading(subject);

    let error = shapesError || (hasLinkedDataErrorForSubject(subject) && `Unable to load metadata for ${subject}`) || '';

    if (!linkedDataLoading && !(linkedDataForSubject && linkedDataForSubject.length > 0)) {
        error = 'No metadata found for this subject';
    }

    const properties = getPropertiesForLinkedData({linkedData: linkedDataForSubject, subject, isEntityEditable});

    return {
        linkedDataLoading,
        linkedDataError: error,
        linkedDataForSubject,
        typeLabel: label,
        typeDescription: description,
        updateLinkedData,
        properties
    };
};

export default useLinkedData;
