import React from 'react';

import BreadCrumbs from "../../common/BreadCrumbs";
import MetadataEntityContainer from './MetadataEntityContainer';

const metadataEntityPage = () => (
    <>
        <BreadCrumbs homeUrl="/metadata" />
        <MetadataEntityContainer showHeader />
    </>
);

export default metadataEntityPage;
