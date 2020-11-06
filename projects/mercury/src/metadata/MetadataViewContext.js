import React from 'react';
import useAsync from "../common/hooks/UseAsync";
import MetadataViewAPI from "./MetadataViewAPI";

const MetadataViewContext = React.createContext({});

export const MetadataViewProvider = ({children, metadataViewApi = MetadataViewAPI}) => {
    const {data: views = [], error, loading, refresh} = useAsync(
        () => metadataViewApi.getViews(),
        []
    );

    const getFacets = () => metadataViewApi.getFacets();
    const getViewData = () => metadataViewApi.getViewData();

    return (
        <MetadataViewContext.Provider
            value={{
                views,
                error,
                loading,
                refresh,
                getFacets,
                getViewData
            }}
        >
            {children}
        </MetadataViewContext.Provider>
    );
};

export default MetadataViewContext;
