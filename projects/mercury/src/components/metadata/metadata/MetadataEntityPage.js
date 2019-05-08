import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import MetadataEntityContainer from './MetadataEntityContainer';
import MetadataEntityHeaderContainer from "./MetadataEntityHeaderContainer";

export default () => (
    <LinkedDataPage homeUrl="/metadata">
        <MetadataEntityHeaderContainer />
        <MetadataEntityContainer />
    </LinkedDataPage>
);
