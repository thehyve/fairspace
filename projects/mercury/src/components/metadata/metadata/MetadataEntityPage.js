import React from 'react';
import {Paper} from "@material-ui/core";

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
                <MetadataEntityContainer subject={subject} />
            </Paper>
        </>
    );
};
