import React from 'react';
import CollectionBrowser from "../../components/collections/CollectionBrowser/CollectionBrowser2";
import metadataStore from "../../services/MetadataStore/MetadataStore";
import collectionStore from "../../services/CollectionStore/CollectionStore";

function Collections(props) {
    const {match: { params }} = props;

    return (
        <CollectionBrowser
            metadataStore={metadataStore}
            collectionStore={collectionStore}

            collection={params.collection}
            path={params.path}
        />
    );
}

export default (Collections);



