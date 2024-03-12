import React from 'react';
import axios from 'axios';
import {extractJsonData, handleHttpError} from '../../common/utils/httpUtils';
import useAsync from '../../common/hooks/UseAsync';

const ExternalMetadataSourceContext = React.createContext({});

export const ExternalMetadataSourceProvider = ({children}) => {
    const {data: externalMetadataSources = [], error, loading, refresh} = useAsync(() => axios.get('/api/metadata-sources/')
        .then(extractJsonData)
        .catch(handleHttpError('Connection error.')));

    return (
        <ExternalMetadataSourceContext.Provider
            value={{
                externalMetadataSources,
                error,
                loading,
                refresh
            }}
        >
            {children}
        </ExternalMetadataSourceContext.Provider>
    );
};

export default ExternalMetadataSourceContext;
