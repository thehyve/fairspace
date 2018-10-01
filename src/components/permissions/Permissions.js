import {connect} from 'react-redux';
import PermissionsViewer from "./PermissionsViewer";
import {alterPermission, fetchPermissions} from "../../actions/permissions";

export const AccessRights = {
    Read: 'Read',
    Write: 'Write',
    Manage: 'Manage',
};

const mapStateToProps = ({permissions, account: {user}}) => {
    return {
        currentLoggedUser: user.data,
        permissions: permissions.fetch,
        alterPermission: permissions.alter
    };
};
const mapDispatchToProps = dispatch => {
    return {
        alterPermission: (userId, collectionId, access) => {
            return dispatch(alterPermission(userId, collectionId, access))
        },
        onFetchPermissions: (collectionId) => {
            dispatch(fetchPermissions(collectionId))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsViewer);
