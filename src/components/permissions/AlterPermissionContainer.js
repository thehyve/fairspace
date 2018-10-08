import {connect} from 'react-redux';
import AlterPermissionDialog from "./AlterPermissionDialog";
import {alterPermission} from "../../actions/permissions";

const mapStateToProps = ({permissions: {alter, fetch}, cache}) => {
    return {
        alteredPermission: alter,
        users: cache.users,
        collaborators: fetch
    };
};

const mapDispatchToProps = dispatch => {
    return {
        alterPermission: (userId, collectionId, access) => {
            return dispatch(alterPermission(userId, collectionId, access))
        },
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(AlterPermissionDialog);
