import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import MetadataEntityContainer from './MetadataEntityContainer';
import MetadataEntityHeaderContainer from "./MetadataEntityHeaderContainer";

export default ({subject}) => {
    return (
        <LinkedDataPage rootBreadCrumb={{label: "Metadata", href: "/metadata", icon: "assignment"}}>
            <MetadataEntityHeaderContainer subject={subject} />
            <MetadataEntityContainer subject={subject} />
        </LinkedDataPage>
    );
};
