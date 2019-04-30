import React from 'react';
import {Paper, Divider} from "@material-ui/core";

import BreadCrumbs from "../../common/BreadCrumbs";
import MetadataEntityContainer from './MetadataEntityContainer';
import {url2iri} from "../../../utils/linkeddata/metadataUtils";
import MetadataEntityHeaderContainer from "./MetadataEntityHeaderContainer";

export default () => {
    const subject = url2iri(window.location.href);

    return (
        <>
            <BreadCrumbs homeUrl="/metadata" />
            <Paper style={{maxWidth: 800, padding: 20}}>
                <MetadataEntityHeaderContainer subject={subject} />
                <Divider style={{marginTop: 16}} />
                <MetadataEntityContainer subject={subject} />
            </Paper>
        </>
    );
};
