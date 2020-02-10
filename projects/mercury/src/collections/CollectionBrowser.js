import React, {useContext, useEffect, useState} from 'react';
import {withRouter} from "react-router-dom";
import Button from "@material-ui/core/Button";
import {
    handleSearchError,
    LoadingInlay,
    MessageDisplay,
    SearchAPI,
    SORT_DATE_CREATED,
    UserContext,
    UsersContext
} from '../common';
import CollectionEditor from './CollectionEditor';
import CollectionList from "./CollectionList";
import {getCollectionAbsolutePath} from '../common/utils/collectionUtils';
import CollectionsContext from "../common/contexts/CollectionsContext";
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI, SEARCH_MAX_SIZE} from "../constants";

const COLLECTION_DIRECTORIES_FILES = [DIRECTORY_URI, FILE_URI, COLLECTION_URI];

export const CollectionBrowser = ({
    loading = false,
    error = false,
    collections = [],
    isSelected = () => false,
    toggleCollection = () => {},
    users = [],
    history,
    query,
    searchFunction = SearchAPI.search
}) => {
    const [addingNewCollection, setAddingNewCollection] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(true);
    const [searchError, setSearchError] = useState();

    const handleAddCollectionClick = () => setAddingNewCollection(true);

    const handleCollectionClick = (collection) => {
        toggleCollection(collection);
    };

    const handleCollectionDoubleClick = (collection) => {
        history.push(getCollectionAbsolutePath(collection.location));
    };

    const handleCancelAddCollection = () => setAddingNewCollection(false);

    useEffect(() => {
        if (!query) {
            setSearchResults([...collections]);
            setSearching(false);
        } else {
            setSearching(true);
            searchFunction(({
                query,
                types: COLLECTION_DIRECTORIES_FILES,
                size: SEARCH_MAX_SIZE,
                sort: SORT_DATE_CREATED
            }))
                .catch(handleSearchError)
                .then(data => {
                    if (data.items) {
                        const filteredCollections = collections.filter(col => (
                            data.items.some(di => di.iri === col.iri)
                        ));
                        setSearchResults(filteredCollections);
                    }
                    setSearchError(undefined);
                })
                .catch((e) => setSearchError(e || true))
                .finally(() => setSearching(false));
        }
    }, [query, collections, searchFunction]);

    const renderCollectionList = () => {
        searchResults.forEach(col => {
            col.creatorObj = users.find(u => u.iri === col.createdBy);
        });
        return (
            <>
                <CollectionList
                    collections={searchResults}
                    isSelected={isSelected}
                    onCollectionClick={handleCollectionClick}
                    onCollectionDoubleClick={handleCollectionDoubleClick}
                />
                {addingNewCollection ? (
                    <CollectionEditor
                        title="Add collection"
                        onClose={handleCancelAddCollection}
                    />
                ) : null}
            </>
        );
    };

    if (error) {
        return <MessageDisplay message="An error occurred while loading collections" />;
    }
    if (searchError) {
        return <MessageDisplay message="An error occurred while searching for collections" />;
    }

    return (
        <>
            {loading || searching ? <LoadingInlay /> : renderCollectionList()}
            <Button
                style={{marginTop: 8}}
                color="primary"
                variant="contained"
                aria-label="Add"
                title="Create a new collection"
                onClick={handleAddCollectionClick}
            >
                New
            </Button>
        </>
    );
};

const ContextualCollectionBrowser = (props) => {
    const {currentUserError, currentUserLoading} = useContext(UserContext);
    const {users, usersLoading, usersError} = useContext(UsersContext);
    const {collections, collectionsLoading, collectionsError} = useContext(CollectionsContext);

    return (
        <CollectionBrowser
            {...props}
            collections={collections}
            users={users}
            loading={collectionsLoading || currentUserLoading || usersLoading}
            error={collectionsError || currentUserError || usersError}
        />
    );
};

export default withRouter(ContextualCollectionBrowser);
