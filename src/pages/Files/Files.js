import React from 'react';
import {Typography} from "@material-ui/core";
import WithS3Client from "../../backend/WithS3Client/WithS3Client";
import FileBrowser from "./FileBrowser";

function Files(props) {
    return (
        <div>
            <Typography variant="title" paragraph={true} noWrap>{'Files overview'}</Typography>
            <WithS3Client>
                <FileBrowser />
            </WithS3Client>
        </div>
    );
}

export default (Files);



