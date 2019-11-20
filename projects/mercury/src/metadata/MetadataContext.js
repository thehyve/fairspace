import React, {useCallback} from 'react';

import {MetadataAPI} from './LinkedDataAPI';
import {getFirstPredicateValue} from '../common/utils/linkeddata/jsonLdUtils';

const MetadataContext = React.createContext({});

export const MetadataProvider = ({children}) => {
    const fetchMetadataBySubject = useCallback((subject) => MetadataAPI.get({subject, includeObjectProperties: true})
        .catch(() => {
            throw new Error('An error occurred while loading the metadata');
        }), []);

    const submitMetadataChanges = (subject, values, vocabulary) => MetadataAPI.get({subject})
        .then(meta => (meta.length && getFirstPredicateValue(meta[0], '@type')))
        .then(type => MetadataAPI.updateEntity(subject, values, vocabulary, type));

    const createMetadataEntity = (subject, values, vocabulary, type) => MetadataAPI.get({subject})
        .then((meta) => {
            if (meta.length) {
                throw Error(`Entity already exists: ${subject}`);
            }
        })
        .then(() => MetadataAPI.updateEntity(subject, values, vocabulary, type))
        .then(() => ({subject, type, values}));

    const deleteMetadataEntity = (subject) => MetadataAPI.delete(subject);

    return (
        <MetadataContext.Provider
            value={{
                fetchMetadataBySubject,
                submitMetadataChanges,
                createMetadataEntity,
                deleteMetadataEntity,
            }}
        >
            {children}
        </MetadataContext.Provider>
    );
};

export default MetadataContext;
