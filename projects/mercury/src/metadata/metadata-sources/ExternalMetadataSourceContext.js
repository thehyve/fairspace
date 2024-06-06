import React, {useContext} from 'react';
import MetadataSourceContext from './MetadataSourceContext';

const ExternalMetadataSourceContext = React.createContext({});

export const ExternalMetadataSourceProvider = ({children}) => {
    const {metadataSources = [], error, loading, refresh} = useContext(MetadataSourceContext);

    const externalMetadataSources = metadataSources.filter(source => source.path !== null);

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
