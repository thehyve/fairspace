import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import MetadataEntityContainer from './MetadataEntityContainer';
import MetadataEntityHeaderContainer from "./MetadataEntityHeaderContainer";

export default ({subject}) => {
    return (
        <LinkedDataPage homeUrl="/metadata">
            <MetadataEntityHeaderContainer subject={subject} />
            <MetadataEntityContainer subject={subject} />
        </LinkedDataPage>
    );
};
