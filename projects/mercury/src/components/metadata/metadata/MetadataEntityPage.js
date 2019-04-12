import React from 'react';
import Paper from "@material-ui/core/Paper";

import BreadCrumbs from "../../common/BreadCrumbs";
import MetadataEntityContainer from './MetadataEntityContainer';
import {url2iri} from "../../../utils/metadataUtils";
import MetadataEntityHeaderContainer from "./MetadataEntityHeaderContainer";

export default () => {
    const subject = url2iri(window.location.href);

    return (
        <>
            <BreadCrumbs homeUrl="/metadata" />
            <Paper>
                <MetadataEntityHeaderContainer subject={subject} />
                <div style={{paddingLeft: 20}}>
                    <MetadataEntityContainer subject={subject} />
                </div>
            </Paper>
        </>
    );
};
