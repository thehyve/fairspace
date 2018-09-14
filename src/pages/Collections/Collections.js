import React from 'react';
import CollectionBrowser from "../../components/collections/CollectionBrowser/CollectionBrowser";
import metadataStore from "../../services/MetadataAPI/MetadataAPI";
import collectionStore from "../../services/CollectionAPI/CollectionAPI";
import FileStoreFactory from "../../services/FileAPI/FileAPIFactory";

function Collections(props) {
    const {match: { params }} = props;

    return (
        <CollectionBrowser
            metadataStore={metadataStore}
            collectionStore={collectionStore}
            fileStoreFactory={FileStoreFactory}
            collection={params.collection}
            path={params.path ? '/' + params.path : undefined}
        />
    );
}

export default (Collections);



