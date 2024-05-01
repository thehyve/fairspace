import React from 'react';
import axios from 'axios';
import {extractJsonData, handleHttpError} from '../../common/utils/httpUtils';
import useAsync from '../../common/hooks/UseAsync';
import {getSvgIcons} from '../../common/IconAPI';
import {MetadataSource} from '../external-views/externalMetadataSourceUtils';

const MetadataSourceContext = React.createContext({});

export const MetadataSourceProvider = ({children}) => {
    const {
        data: metadataSources = ([]: MetadataSource[]),
        error,
        loading,
        refresh
    } = useAsync(() =>
        axios
            .get('/api/metadata-sources/')
            .then(extractJsonData)
            .then(getSvgIcons)
            .catch(handleHttpError('Connection error.'))
    );

    return (
        <MetadataSourceContext.Provider
            value={{
                metadataSources,
                error,
                loading,
                refresh
            }}
        >
            {children}
        </MetadataSourceContext.Provider>
    );
};

export default MetadataSourceContext;
