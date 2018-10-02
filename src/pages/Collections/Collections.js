import React from 'react';
import CollectionBrowser from "../../components/collections/CollectionBrowser/CollectionBrowser";
import WithInfoDrawer from "../../components/collections/WithInfoDrawer/WithInfoDrawer";

function Collections(props) {
    return (
        <WithInfoDrawer>
            <CollectionBrowser />
        </WithInfoDrawer>
    );
}

export default (Collections);



