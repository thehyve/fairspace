import {connect} from 'react-redux';
import AlterPermissionDialog from "./AlterPermissionDialog";
import {alterPermission} from "../../actions/permissions";
import {fetchUsers} from "../../actions/users";

const mapStateToProps = ({permissions: {alter}, users}) => {
    return {
        alteredPermission: alter,
        users: users,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        alterPermission: (userId, collectionId, access) => {
            return dispatch(alterPermission(userId, collectionId, access))
        },
        fetchUsers: () => {
            return dispatch(fetchUsers())
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(AlterPermissionDialog);
