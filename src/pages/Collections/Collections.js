import React from 'react';
import CollectionBrowser from "../../components/collections/CollectionBrowser/CollectionBrowser";
import metadataAPI from "../../services/MetadataAPI/MetadataAPI";
import collectionAPI from "../../services/CollectionAPI/CollectionAPI";
import FileAPIFactory from "../../services/FileAPI/FileAPIFactory";

function Collections(props) {
    const {match: { params }} = props;

    return (
        <CollectionBrowser
            metadataAPI={metadataAPI}
            collectionAPI={collectionAPI}
            fileAPIFactory={FileAPIFactory}
            collection={params.collection}
            path={params.path ? '/' + params.path : undefined}
        />
    );
}

export default (Collections);



