import {connect} from 'react-redux';
import AlterPermissionDialog from "./AlterPermissionDialog";
import {alterPermission} from "../../actions/permissions";
import {fetchUsers} from "../../actions/users";

/**
 * Transform result to become react-select friendly array [{label: string, value: string}]
 * @param users
 * @returns {Array}
 */
export const transformUserToOptions = (users) => {
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
export const getNoOptionMessage = (users) => {
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

/**
 * Disable options if a user is :
 *  - already a collaborator,
 *  - current logged user, or
 *  - owner of the collection
 * @param options
 * @param collaborators
 * @param currentLoggedUser
 * @param owner
 */
export const applyDisableFilter = (options, collaborators, currentLoggedUser, owner) => {
    return options.map(r => {
        r.disabled =
            collaborators.find(c => c.subject === r.value) ? true : r.value === currentLoggedUser.id ||
            r.value === owner;
        return r;
    });
};

/**
 * Get user label by user object
 * @param user
 * @param options
 * @returns {string}
 */
export const getUserLabelByUser = (user, options) => {
    const found = options.find(option => option.value === user.subject);
    return found ? found.label : '';
};

const mapStateToProps = ({permissions, users}) => {
    return {
        alterPermission: permissions.alter,
        users: users,
        options: transformUserToOptions(users),
        noOptionMessage: () => getNoOptionMessage(users)
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
