import {useCallback, useContext, useEffect} from 'react';

import LinkedDataContext from './LinkedDataContext';
import {fromJsonLd, getJsonLdForSubject} from "../../utils/linkeddata/jsonLdConverter";

/**
 * This custom hook is a helper for many Linked Data functions, such as fetching, searching and transforming/parsing metadata.
 * It is agnostic about the difference between metadata, vocabular and metavocabulary.
 * The contextual logic is being provided by {@link LinkedDataContext}
 *
 * @param {string} subject
 */
export const useLinkedData = (subject, context = {}) => {
    if (!subject) {
        throw new Error('Please provide a valid subject.');
    }

    const {
        shapes,
        shapesLoading = false,
        shapesError = false,
        fetchLinkedDataForSubject = () => {},
        isLinkedDataLoading = () => false,
        hasLinkedDataErrorForSubject = () => false,
        getLinkedDataForSubject = () => {},
        getTypeInfoForLinkedData = () => {}
    } = context;

    // useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
    const updateLinkedData = useCallback(() => {
        fetchLinkedDataForSubject(subject);
    }, [fetchLinkedDataForSubject, subject]);

    useEffect(() => {
        updateLinkedData();
    }, [updateLinkedData]);

    const linkedData = getLinkedDataForSubject(subject);
    let properties = [];
    let values = {};
    let typeInfo = {};

    if (linkedData) {
        const linkedDataItem = getJsonLdForSubject(linkedData, subject);
        typeInfo = getTypeInfoForLinkedData(linkedDataItem);

        if (!Array.isArray(linkedDataItem['@type'])) {
            console.warn("Can not get values from metadata without a type or that is not expanded");
        } else {
            const propertyShapes = shapes.determinePropertyShapesForTypes(linkedDataItem['@type']);
            properties = shapes.getProperties(propertyShapes);
            values = fromJsonLd(linkedDataItem, propertyShapes, linkedData, shapes);
        }
    }

    const linkedDataLoading = shapesLoading || isLinkedDataLoading(subject);

    let error = shapesError || (hasLinkedDataErrorForSubject(subject) && `Unable to load metadata for ${subject}`) || '';

    if (!error && !linkedDataLoading && !(properties && properties.length > 0)) {
        error = 'No metadata found for this subject';
    }

    return {
        linkedDataLoading,
        linkedDataError: error,
        properties,
        values,
        typeInfo,
        updateLinkedData
    };
};

// Export a custom hook attached to the context by default
export default (subject) => useLinkedData(subject, useContext(LinkedDataContext));
