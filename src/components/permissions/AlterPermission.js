import {connect} from 'react-redux';
import AlterPermissionDialog from "./AlterPermissionDialog";
import {alterPermission} from "../../actions/permissions";


const mapStateToProps = ({permissions}) => {
    return {
        alterPermission: permissions.alter
    };
};
const mapDispatchToProps = dispatch => {
    return {
        onAlterPermission: (userId, collectionId, access) => {
           return dispatch(alterPermission(userId, collectionId, access))
        },
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(AlterPermissionDialog);
