import {connect} from 'react-redux';
import PermissionsViewer from "./PermissionsViewer";
import {alterPermission, fetchPermissions} from "../../actions/permissions";

const getCollaborators = (permissions, users) => {
    if (permissions.data && users.data) {
        permissions.data = permissions.data.map(p => {
            const user = users.data.find(user => user.id === p.subject) || {};
            return Object.assign(user, p);
        });
        return permissions
    }
    return permissions;
};

const mapStateToProps = ({permissions: {fetch, alter}, account: {user}, cache: {users}}) => {
    return {
        currentLoggedUser: user.data,
        permissions: getCollaborators(fetch, users),
        alteredPermission: alter,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        alterPermission: (userId, collectionId, access) => {
            return dispatch(alterPermission(userId, collectionId, access))
        },
        fetchPermissions: (collectionId, noCache = false) => {
            dispatch(fetchPermissions(collectionId, noCache))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsViewer);
