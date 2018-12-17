import {connect} from 'react-redux';
import PermissionsViewer from "./PermissionsViewer";
import {alterPermission, fetchPermissionsIfNeeded} from "../../actions/permissions";

const mapStateToProps = (state, ownProps) => {
    const {
        account: {user},
        cache: {users, permissionsByCollection},
        ui: { pending: { alterPermission }}
    } = state;

    const collectionPermission = permissionsByCollection[ownProps.collectionId] || { pending: true }

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
    alterPermission,
    fetchPermissionsIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsViewer);
