import React from 'react';
import FileBrowser from "./FileBrowser";
import WithInfoDrawer from "../common/WithInfoDrawer";

function Files(props) {
    const {match: {params}} = props;

    return (
        <WithInfoDrawer>
            <FileBrowser
                openedCollectionId={parseInt(params.collection, 10)}
                openedPath={params.path ? `/${params.path}` : '/'}
            />
        </WithInfoDrawer>
    );
}

export default Files;
