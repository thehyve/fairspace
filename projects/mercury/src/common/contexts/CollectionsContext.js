import React from 'react';
import {useAsync} from '../hooks';
import CollectionAPI from "../../collections/CollectionAPI";
import type {Collection, CollectionProperties, Resource} from '../../collections/CollectionAPI';

const CollectionsContext = React.createContext({});

export const CollectionsProvider = ({children, collectionApi = CollectionAPI}) => {
    const {data: collections = [], error, loading, refresh} = useAsync(collectionApi.getCollections);

    const addCollection = (collection: CollectionProperties) => collectionApi.addCollection(collection).then(refresh);
    const updateCollection = (collection: Collection) => collectionApi.updateCollection(collection).then(refresh);
    const deleteCollection = (collection: Resource) => collectionApi.deleteCollection(collection).then(refresh);

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
