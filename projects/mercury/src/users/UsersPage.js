import React from 'react';
import {BreadCrumbs, usePageTitleUpdater} from '../common';

import UserList from './UserList';
import UsersBreadcrumbsContextProvider from './UsersBreadcrumbsContextProvider';
import LinkedDataMetadataProvider from '../metadata/LinkedDataMetadataProvider';

const UsersPage = () => {
    usePageTitleUpdater('Users');

    return (
        <LinkedDataMetadataProvider>
            <UsersBreadcrumbsContextProvider>
                <BreadCrumbs />
                <UserList />
            </UsersBreadcrumbsContextProvider>
        </LinkedDataMetadataProvider>
    );
};

export default UsersPage;
