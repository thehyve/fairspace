import {connect} from 'react-redux';
import PermissionsViewer from "./PermissionsViewer";
import {alterPermission as alterPermissionActions, fetchPermissionsIfNeeded} from "../../actions/permissionsActions";

const mapStateToProps = (state, ownProps) => {
    const {
        account: {user},
        cache: {users, permissionsByIri},
        ui: {pending: {alterPermission}}
    } = state;

    const collectionPermission = permissionsByIri[ownProps.iri] || {pending: true};

    return {
        loading: user.pending || users.pending || collectionPermission.pending,
        altering: alterPermission,
        error: user.error || users.error || collectionPermission.error,
        currentUser: user.data,
        permissions: collectionPermission.data,
        users: users.data
    };
};

const mapDispatchToProps = {
    alterPermission: alterPermissionActions,
    fetchPermissionsIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsViewer);
