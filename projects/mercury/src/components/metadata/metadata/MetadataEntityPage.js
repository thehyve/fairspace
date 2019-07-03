import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import MetadataEntityContainer from './MetadataEntityContainer';
import MetadataEntityHeaderContainer from "./MetadataEntityHeaderContainer";
import MetadataBreadcrumbsContextProvider from "./MetadataBreadcrumbsContextProvider";

export default ({subject}) => {
    return (
        <MetadataBreadcrumbsContextProvider>
            <LinkedDataPage>
                <MetadataEntityHeaderContainer subject={subject} />
                <MetadataEntityContainer subject={subject} />
            </LinkedDataPage>
        </MetadataBreadcrumbsContextProvider>
    );
};
