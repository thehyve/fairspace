import {connect} from 'react-redux';
import PermissionsViewer from "./PermissionsViewer";
import {alterPermission, fetchPermissions} from "../../actions/permissions";

const mapStateToProps = ({permissions: {fetch, alter}, account: {user}, cache: {users}}) => {
    return {
        currentLoggedUser: user.data,
        permissions: fetch,
        alteredPermission: alter,
        users: users.data
    };
};

const mapDispatchToProps = dispatch => {
    return {
        alterPermission: (userId, collectionId, access) => {
            return dispatch(alterPermission(userId, collectionId, access))
        },
        fetchPermissions: (collectionId, useCache = true) => {
            dispatch(fetchPermissions(collectionId, useCache))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsViewer);
