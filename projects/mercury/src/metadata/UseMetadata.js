import {useState, useCallback} from 'react';

import {MetadataAPI} from './LinkedDataAPI';

const UseMetadata = () => {
    const [metadata, setMetadata] = useState([]);
    const [metadataLoading, setMetadataLoading] = useState(false);
    const [metadataError, setMetadataError] = useState(false);

    const fetchMetadataBySubject = useCallback((subject) => {
        setMetadataLoading(true);
        MetadataAPI.get({subject, includeObjectProperties: true})
            .then(data => {
                setMetadata(data);
                setMetadataLoading(false);
                setMetadataError(false);
            })
            .catch(() => {
                setMetadataError('An error occurred while loading the metadata');
            });
    }, []);

    return {
        metadata,
        metadataLoading,
        metadataError,
        fetchMetadataBySubject,
    };
};

export default UseMetadata;
