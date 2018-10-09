import {connect} from 'react-redux';
import AlterPermissionDialog from "./AlterPermissionDialog";
import {alterPermission} from "../../actions/permissions";
<<<<<<< HEAD
=======
import {fetchUsers} from "../../actions/workspace";
>>>>>>> adjust theme color

const mapStateToProps = ({permissions: {alter, fetch}, cache}) => {
    return {
        alteredPermission: alter,
        users: cache.users,
        collaborators: fetch
    };
};

const mapDispatchToProps = { alterPermission };

export default connect(mapStateToProps, mapDispatchToProps)(AlterPermissionDialog);
