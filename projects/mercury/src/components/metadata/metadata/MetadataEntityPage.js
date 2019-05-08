import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import MetadataEntityContainer from './MetadataEntityContainer';
import MetadataEntityHeaderContainer from "./MetadataEntityHeaderContainer";
import {url2iri} from "../../../utils/linkeddata/metadataUtils";

export default () => {
    const subject = url2iri(window.location.href);
    return (
        <LinkedDataPage homeUrl="/metadata">
            <MetadataEntityHeaderContainer subject={subject} />
            <MetadataEntityContainer subject={subject} />
        </LinkedDataPage>
    );
};
