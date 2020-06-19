import React, {useState} from 'react';
import type {Collection, CollectionProperties, Resource} from './CollectionAPI';
import CollectionAPI from "./CollectionAPI";
import useAsync from "../common/hooks/UseAsync";

const CollectionsContext = React.createContext({});

export const CollectionsProvider = ({children, collectionApi = CollectionAPI}) => {
    const [showDeleted, setShowDeleted] = useState(false);

    const {data: collections = [], error, loading, refresh} = useAsync(
        () => collectionApi.getCollections(showDeleted),
        [showDeleted]
    );

    const addCollection = (collection: CollectionProperties) => collectionApi.addCollection(collection).then(refresh);
    const updateCollection = (collection: Collection) => collectionApi.updateCollection(collection).then(refresh);
    const deleteCollection = (collection: Resource) => collectionApi.deleteCollection(collection, showDeleted).then(refresh);
    const undeleteCollection = (collection: Resource) => collectionApi.undeleteCollection(collection).then(refresh);

    return (
        <CollectionsContext.Provider
            value={{
                collections,
                error,
                loading,
                refresh,
                addCollection,
                deleteCollection,
                undeleteCollection,
                updateCollection,
                showDeleted,
                setShowDeleted
            }}
        >
            {children}
        </CollectionsContext.Provider>
    );
};

export default CollectionsContext;
