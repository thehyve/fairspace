import React from 'react';
import MetadataViewAPI from "./MetadataViewAPI";
import useAsync from "../../common/hooks/UseAsync";

const MetadataViewFacetsContext = React.createContext({});

export const MetadataViewFacetsProvider = ({children, metadataViewApi = MetadataViewAPI}) => {
    const {data = {}, error, loading, refresh} = useAsync(
        () => metadataViewApi.getFacets(),
        []
    );

    return (
        <MetadataViewFacetsContext.Provider
            value={{
                facets: data.facets,
                error,
                loading,
                refresh
            }}
        >
            {children}
        </MetadataViewFacetsContext.Provider>
    );
};

export default MetadataViewFacetsContext;
