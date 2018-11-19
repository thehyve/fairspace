import {connect} from 'react-redux';
import AlterPermissionDialog from "../../components/permissions/AlterPermissionDialog";
import {alterPermission} from "../../actions/permissions";

const mapStateToProps = ({permissions: {alter, fetch}, cache}) => {
    return {
        alteredPermission: alter,
        users: cache.users,
        collaborators: fetch
    };
};

const mapDispatchToProps = { alterPermission };

export default connect(mapStateToProps, mapDispatchToProps)(AlterPermissionDialog);
