import React from 'react';
import WithS3Client from "../../backend/WithS3Client/WithS3Client";
import CollectionBrowser from "../../components/collections/CollectionBrowser/CollectionBrowser";
import metadataStore from "../../services/MetadataStore/MetadataStore";

function Collections(props) {
    return (
        <WithS3Client>
            <CollectionBrowser metadataStore={metadataStore}/>
        </WithS3Client>
    );
}

export default (Collections);



