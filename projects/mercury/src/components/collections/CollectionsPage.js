import React from 'react';
import CollectionBrowser from "./CollectionBrowser";
import WithInfoDrawer from "../common/WithInfoDrawer";

const collectionsPage = () => (
    <WithInfoDrawer>
        <CollectionBrowser />
    </WithInfoDrawer>
);

export default collectionsPage;
