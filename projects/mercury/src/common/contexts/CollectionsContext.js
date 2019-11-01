import React from 'react';
import {useAsync} from '@fairspace/shared-frontend';
import CollectionAPI from "../../collections/CollectionAPI";

const CollectionsContext = React.createContext({});

export const CollectionsProvider = ({children, collectionApi = CollectionAPI}) => {
    const {data: collections = [], error, loading, refresh} = useAsync(collectionApi.getCollections);

    const addCollection = (...args) => collectionApi.addCollection(...args).then(refresh);
    const updateCollection = (...args) => collectionApi.updateCollection(...args).then(refresh);
    const deleteCollection = (...args) => collectionApi.deleteCollection(...args).then(refresh);

    return (
        <CollectionsContext.Provider
            value={{
                collections,
                error,
                loading,
                refresh,
                addCollection,
                updateCollection,
                deleteCollection
            }}
        >
            {children}
        </CollectionsContext.Provider>
    );
};

export default CollectionsContext;
