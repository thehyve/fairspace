import {connect} from 'react-redux';
import AlterPermissionDialog from "./AlterPermissionDialog";
import {alterPermission} from "../../actions/permissions";
import {fetchUsers} from "../../actions/users";

/**
 * Transform result to become react-select friendly array [{label: string, value: string}]
 * @param users
 * @returns {Array}
 */
const transformUserToOptions = (users) => {
    if (users.data) {
        return users.data ? users.data.map(r => {
            let newUser = Object.assign({}, r);
            newUser.label = `${r.firstName} ${r.lastName}`;
            newUser.value = r.id;
            return newUser;
        }) : [];
    }
};

/**
 * Get no options message based on users
 * @param users
 * @returns {string}
 */
const getNoOptionMessage = (users) => {
    let noOptionMessage = 'No options';
    if (users) {
        if (users.pending) {
            noOptionMessage = 'Loading ..';
        } else if (users.error) {
            noOptionMessage = 'Error: Cannot fetch users.';
        }
    }
    return noOptionMessage;
};

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
