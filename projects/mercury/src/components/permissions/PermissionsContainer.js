import React, {useContext, useState} from "react";
import {connect} from 'react-redux';
import PermissionsViewer from "./PermissionsViewer";
import PermissionContext from "./PermissionContext";
import PermissionAPI from "../../services/PermissionAPI";

// This component has the context-approach and the redux approach mixed
// together. In the near future, the user-information and users-information
// will be removed from redux as well. This component could be simplified or
// removed at that moment
const mapStateToProps = (state, ownProps) => {
    const {
        account: {user},
    } = state;

    return {
        loading: user.pending || ownProps.loading,
        error: user.error || ownProps.error,
        currentUser: user.data
    };
};

const ConnectedPermissionsViewer = connect(mapStateToProps)(PermissionsViewer);

export default (props) => {
    const {permissions, loading, error, refresh} = useContext(PermissionContext);
    const [altering, setAltering] = useState(false);

    const alterPermission = (userIri, resourceIri, access) => {
        setAltering(true);
        return PermissionAPI
            .alterPermission(userIri, resourceIri, access)
            .then(refresh)
            .catch(e => {console.error("Error altering permission", e);})
            .finally(() => setAltering(false));
    }

    return (
        <ConnectedPermissionsViewer
            loading={loading}
            error={error}
            altering={altering}
            permissions={permissions}
            alterPermission={alterPermission}
            {...props}
        />
    );
};
