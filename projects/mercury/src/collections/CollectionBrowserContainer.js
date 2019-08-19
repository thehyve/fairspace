import React, {useContext} from 'react';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';

import CollectionBrowser from './CollectionBrowser';
import * as collectionBrowserActions from "../common/redux/actions/collectionBrowserActions";
import * as collectionActions from "../common/redux/actions/collectionActions";
import UsersContext from '../common/contexts/UsersContext';
import UserContext from '../common/contexts/UserContext';

const CollectionBrowserContainer = (props) => {
    const {currentUserError, currentUserLoading} = useContext(UserContext);
    const {users, usersLoading, usersError} = useContext(UsersContext);

    return (
        <CollectionBrowser
            currentUserError={currentUserError}
            currentUserLoading={currentUserLoading}
            users={users}
            usersLoading={usersLoading}
            usersError={usersError}
            {...props}
        />
    );
};


const mapStateToProps = (state) => ({
    loading: state.cache.collections.pending,
    error: state.cache.collections.error,
    collections: state.cache.collections.data,
    selectedCollectionLocation: state.collectionBrowser.selectedCollectionLocation,
    addingCollection: state.collectionBrowser.addingCollection,
    deletingCollection: state.collectionBrowser.deletingCollection
});

const mapDispatchToProps = {
    ...collectionActions,
    ...collectionBrowserActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CollectionBrowserContainer));
