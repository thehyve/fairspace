import React from 'react';
import CollectionBrowser from "../../components/collections/CollectionBrowser/CollectionBrowser";
import metadataStore from "../../services/MetadataStore/MetadataStore";
import collectionStore from "../../services/CollectionStore/CollectionStore";
import FileStoreFactory from "../../services/FileStore/FileStoreFactory";

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



