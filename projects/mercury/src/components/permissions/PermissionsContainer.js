import React from 'react';
import {connect} from 'react-redux';
import PermissionsViewer from "./PermissionsViewer";
import {alterPermission as alterPermissionActions, fetchPermissionsIfNeeded} from "../../actions/permissionsActions";

import AlterPermissionContainer from "./AlterPermissionContainer";

const PermissionsContainer = (props) => (
    <PermissionsViewer
        {...props}
        renderPermissionsDialog={
            ({handleShareWithDialogClose, selectedPermission, currentUser, iri}) => (
                <AlterPermissionContainer
                    open
                    onClose={handleShareWithDialogClose}
                    user={selectedPermission && selectedPermission.user}
                    access={selectedPermission && selectedPermission.access}
                    iri={iri}
                    currentUser={currentUser}
                />
            )}
    />
);

const mapStateToProps = (state, ownProps) => {
    const {
        cache: {users, permissionsByIri},
        ui: {pending: {alterPermission}}
    } = state;

    const collectionPermission = permissionsByIri[ownProps.iri] || {pending: true};

    return {
        loading: users.pending || collectionPermission.pending,
        altering: alterPermission,
        error: users.error || collectionPermission.error,
        permissions: collectionPermission.data,
        users: users.data
    };
};

const mapDispatchToProps = {
    alterPermission: alterPermissionActions,
    fetchPermissionsIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsContainer);
