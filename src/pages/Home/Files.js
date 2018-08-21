import React from 'react';
import FileBrowser from "../../components/collections/FileList/FileBrowser";

function Files(props) {
    const { match: { params }} = props;

    return (
        <FileBrowser path={params.path}></FileBrowser>
    );
}

export default Files;



