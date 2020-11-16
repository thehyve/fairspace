import React from 'react';
import useAsync from "../common/hooks/UseAsync";
import MetadataViewAPI from "./MetadataViewAPI";

const MetadataViewContext = React.createContext({});

export const MetadataViewProvider = ({children, metadataViewApi = MetadataViewAPI}) => {
    const {data: views = [], error, loading, refresh} = useAsync(
        () => metadataViewApi.getViews(),
        []
    );

    return (
        <MetadataViewContext.Provider
            value={{
                views,
                error,
                loading,
                refresh
            }}
        >
            {children}
        </MetadataViewContext.Provider>
    );
};

export default MetadataViewContext;
