import React from 'react';
import CollectionBrowser from "../../components/collections/CollectionBrowser/CollectionBrowser";
import metadataAPI from "../../services/MetadataAPI/MetadataAPI";
import collectionAPI from "../../services/CollectionAPI/CollectionAPI";
import FileAPIFactory from "../../services/FileAPI/FileAPIFactory";
import WithInfoDrawer from "../../components/collections/WithInfoDrawer/WithInfoDrawer";

function Collections(props) {
    const {match: { params }} = props;

    return (
        <WithInfoDrawer>
            <CollectionBrowser
                metadataAPI={metadataAPI}
                collectionAPI={collectionAPI}
                fileAPIFactory={FileAPIFactory}
                openedCollectionId={params.collection}
                openedPath={params.path ? '/' + params.path : undefined}
            />
        </WithInfoDrawer>
    );
}

export default (Collections);



