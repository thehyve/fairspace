import {useCallback, useContext, useEffect, useState} from 'react';

import LinkedDataContext from '../LinkedDataContext';
import {fromJsonLd, getJsonLdForSubject} from './jsonLdConverter';
import {determinePropertyShapesForTypes, getProperties} from './vocabularyUtils';
import {getTypeInfo} from './metadataUtils';

/**
 * This custom hook is a helper for many Linked Data functions, such as fetching, searching and transforming/parsing metadata.
 * It is agnostic about the difference between metadata and vocabulary.
 * The contextual logic is being provided by {@link LinkedDataContext}
 *
 * @param {string} subject
 */
export const useLinkedDataNoContext = (subject, context = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const [properties, setProperties] = useState([]);
    const [propertiesLoaded, setPropertiesLoaded] = useState(false);
    const [values, setValues] = useState({});
    const [typeInfo, setTypeInfo] = useState({});

    const {shapes, shapesLoading, shapesError, fetchLinkedDataForSubject} = context;

    const updateLinkedData = useCallback(() => {
        if (Array.isArray(shapes) && shapes.length > 0) {
            setLoading(true);

            return fetchLinkedDataForSubject(subject)
                .then(ld => {
                    if (ld && Object.keys(ld).length > 0) {
                        const linkedDataItem = getJsonLdForSubject(ld, subject);
                        setTypeInfo(getTypeInfo(linkedDataItem, shapes));

                        if (!Array.isArray(linkedDataItem['@type'])) {
                            console.warn('Can not get values from metadata without a type or that is not expanded');
                        } else {
                            const propertyShapes = determinePropertyShapesForTypes(shapes, linkedDataItem['@type']);
                            setProperties(getProperties(shapes, propertyShapes));
                            setValues(fromJsonLd(linkedDataItem, propertyShapes, ld, shapes));
                        }
                    }
                })
                .catch(e => {
                    if (e) {
                        console.error('Error fetching linked data', e);
                    }
                    setError(e || true);
                })
                .finally(() => {
                    setPropertiesLoaded(true);
                    setLoading(false);
                });
        }
        return null;
    }, [fetchLinkedDataForSubject, shapes, subject]);

    useEffect(() => {
        updateLinkedData();
    }, [updateLinkedData]);

    const linkedDataLoading = shapesLoading || loading;

    let err = shapesError || (error && `Unable to load metadata for ${subject}`) || '';

    if (!err && !linkedDataLoading && propertiesLoaded && properties.length === 0) {
        err = 'No metadata found for this subject';
    }

    return {
        linkedDataLoading,
        linkedDataError: err,
        properties,
        values,
        typeInfo,
        updateLinkedData
    };
};

// Export a custom hook attached to the context by default
export default subject => useLinkedDataNoContext(subject, useContext(LinkedDataContext));
