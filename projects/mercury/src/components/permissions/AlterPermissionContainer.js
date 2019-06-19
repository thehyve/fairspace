import React, {useContext} from "react";
import {connect} from 'react-redux';
import AlterPermissionDialog from "./AlterPermissionDialog";
import PermissionContext from "./PermissionContext";

// This component has the context-approach and the redux approach mixed
// together. In the near future, the user-information and users-information
// will be removed from redux as well. This component could be simplified or
// removed at that moment
const mapStateToProps = ({cache}) => ({
    users: cache.users,
});

const ConnectedAlterPermissionDialog = connect(mapStateToProps)(AlterPermissionDialog);

const AlterPermissionContainer = props => {
    const {permissions} = useContext(PermissionContext);

    return (
        <ConnectedAlterPermissionDialog
            {...props}
            collaborators={permissions}
        />
    );
};


export default AlterPermissionContainer;
