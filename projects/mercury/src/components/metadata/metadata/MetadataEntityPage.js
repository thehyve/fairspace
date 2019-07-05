import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import LinkedDataEntityFormContainer from '../common/LinkedDataEntityFormContainer';
import MetadataEntityHeaderContainer from "./MetadataEntityHeaderContainer";
import MetadataBreadcrumbsContextProvider from "./MetadataBreadcrumbsContextProvider";

export default ({subject}) => {
    return (
        <MetadataBreadcrumbsContextProvider>
            <LinkedDataPage>
                <MetadataEntityHeaderContainer subject={subject} />
                <LinkedDataEntityFormContainer subject={subject} />
            </LinkedDataPage>
        </MetadataBreadcrumbsContextProvider>
    );
};
