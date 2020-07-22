import React, {useContext} from "react";

import AlterPermissionDialog from "./AlterPermissionDialog";
import CollectionsContext from "../collections/CollectionsContext";

const AlterPermissionContainer = props => {
    const {setPermission, loading, error} = useContext(CollectionsContext);

    return (
        <AlterPermissionDialog
            {...props}
            setPermission={setPermission}
            loading={loading}
            error={error}
        />
    );
};


export default AlterPermissionContainer;
