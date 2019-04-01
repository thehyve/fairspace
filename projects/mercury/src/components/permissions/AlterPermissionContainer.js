import {connect} from 'react-redux';
import AlterPermissionDialog from "./AlterPermissionDialog";
import {alterPermission} from "../../actions/permissionsActions";

const mapStateToProps = ({cache}, {iri}) => ({
    users: cache.users,
    collaborators: cache.permissionsByIri[iri]
});

const mapDispatchToProps = {alterPermission};

export default connect(mapStateToProps, mapDispatchToProps)(AlterPermissionDialog);
