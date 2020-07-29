import React, {useContext, useState} from 'react';
import type {Collection, CollectionProperties} from './CollectionAPI';
import CollectionAPI from "./CollectionAPI";
import useAsync from "../common/hooks/UseAsync";
import VocabularyContext from "../metadata/vocabulary/VocabularyContext";
import UserContext from "../users/UserContext";

const CollectionsContext = React.createContext({});

export const CollectionsProvider = ({children, collectionApi = CollectionAPI}) => {
    const [showDeleted, setShowDeleted] = useState(false);
    const {vocabulary} = useContext(VocabularyContext);
    const {currentUser} = useContext(UserContext);


    const {data: collections = [], error, loading, refresh} = useAsync(
        () => collectionApi.getCollections(showDeleted),
        [currentUser, showDeleted]
    );

    const addCollection = (collection: CollectionProperties) => collectionApi.addCollection(collection, vocabulary).then(refresh);
    const updateCollection = (collection: Collection) => collectionApi.updateCollection(collection, vocabulary).then(refresh);
    const deleteCollection = (collection: CollectionProperties) => collectionApi.deleteCollection(collection, showDeleted).then(refresh);
    const undeleteCollection = (collection: CollectionProperties) => collectionApi.undeleteCollection(collection).then(refresh);
    const relocateCollection = (oldLocation: string, newLocation: string) => collectionApi.relocateCollection(oldLocation, newLocation).then(refresh);
    const setPermission = (location: string, principal: string, access: string) => collectionApi.setPermission(location, principal, access).then(refresh);
    const setAccessMode = (location: string, mode: string) => collectionApi.setAccessMode(location, mode).then(refresh);
    const setStatus = (location: string, status: string) => collectionApi.setStatus(location, status).then(refresh);

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
                relocateCollection,
                setPermission,
                setAccessMode,
                setStatus,
                showDeleted,
                setShowDeleted
            }}
        >
            {children}
        </CollectionsContext.Provider>
    );
};

export default CollectionsContext;
