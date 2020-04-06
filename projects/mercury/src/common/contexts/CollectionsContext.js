import React from 'react';
import {useAsync} from '../hooks';
import type {Collection, CollectionProperties} from '../../collections/CollectionAPI';
import CollectionAPI from "../../collections/CollectionAPI";

const CollectionsContext = React.createContext({});

export const CollectionsProvider = ({children, collectionApi = CollectionAPI}) => {
    const {data: collections = [], error, loading, refresh} = useAsync(collectionApi.getCollections);

    const addCollection = (collection: CollectionProperties) => collectionApi.addCollection(collection).then(refresh);
    const updateCollection = (collection: Collection) => collectionApi.updateCollection(collection).then(refresh);

    return (
        <CollectionsContext.Provider
            value={{
                collections,
                error,
                loading,
                refresh,
                addCollection,
                updateCollection
            }}
        >
            {children}
        </CollectionsContext.Provider>
    );
};

export default CollectionsContext;
