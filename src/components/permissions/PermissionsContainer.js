import {connect} from 'react-redux';
import PermissionsViewer from "./PermissionsViewer";
import {alterPermission, fetchPermissions} from "../../actions/permissions";

const mapStateToProps = ({permissions: {fetch, alter}, account: {user}}) => {
    return {
        currentLoggedUser: user.data,
        permissions: fetch,
        alteredPermission: alter
    };
};

const mapDispatchToProps = dispatch => {
    return {
        alterPermission: (userId, collectionId, access) => {
            return dispatch(alterPermission(userId, collectionId, access))
        },
        fetchPermissions: (collectionId) => {
            dispatch(fetchPermissions(collectionId))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsViewer);
