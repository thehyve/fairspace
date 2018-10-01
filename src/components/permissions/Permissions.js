import {connect} from 'react-redux';
import PermissionsViewer from "./PermissionsViewer";
import {alterPermission, fetchPermissions} from "../../actions/permissions";
import {compareBy, comparing} from "../../utils/comparators";

export const AccessRights = {
    Read: 'Read',
    Write: 'Write',
    Manage: 'Manage',
};

/**
 * Get permission level
 * @param p
 * @returns {*}
 */
export const permissionLevel = (p) => {
    return {Manage: 0, Write: 1, Read: 2}[p.access]
};

/**
 * Sort and filter permissions
 * @param permissions
 * @param creator
 * @returns {*}
 */
export const sortAndFilterPermissions = (permissions, creator) => {
    if (permissions && permissions.data) {
        return permissions.data.filter(item => item.subject !== creator)
            .sort(comparing(compareBy(permissionLevel), compareBy('subject')));
    } else {
        return [];
    }
};

const mapStateToProps = ({permissions, account: {user}}) => {
    return {
        currentLoggedUser: user.data,
        permissions: permissions.fetch,
        alteredPermission: permissions.alter
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
