import React from 'react';
import CollectionBrowser from "../../components/collections/CollectionBrowser/CollectionBrowser";
import WithInfoDrawer from "../../components/collections/WithInfoDrawer/WithInfoDrawer";
import asPage from "../../containers/asPage/asPage";

function Collections(props) {
    return (
        <WithInfoDrawer>
            <CollectionBrowser />
        </WithInfoDrawer>
    );
}

export default asPage(Collections);
