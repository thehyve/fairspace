import {connect} from 'react-redux';
import AlterPermissionDialog from "./AlterPermissionDialog";
import {alterPermission} from "../../actions/permissionsActions";

const mapStateToProps = ({cache}, {collectionId}) => ({
    users: cache.users,
    collaborators: cache.permissionsByCollection[collectionId]
});

const mapDispatchToProps = {alterPermission};

export default connect(mapStateToProps, mapDispatchToProps)(AlterPermissionDialog);
