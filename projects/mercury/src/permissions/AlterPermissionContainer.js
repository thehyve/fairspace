import React, {useContext} from "react";

import AlterPermissionDialog from "./AlterPermissionDialog";
import PermissionContext, {PermissionProvider} from "./PermissionContext";
import CollectionsContext from "../collections/CollectionsContext";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";

const AlterPermissionContainer = props => {
    const {permissions: collaborators, loading: loadingPermissions, error: errorPermissions} = useContext(PermissionContext);
    const {collections, loading: loadingCollections, error: errorCollections} = useContext(CollectionsContext);

    if (errorCollections) {
        return (<MessageDisplay message="An error occurred while fetching collections." />);
    }
    if (loadingCollections) {
        return (<LoadingInlay />);
    }

    const currentCollection = collections.find(c => c.iri === props.iri);

    return (
        <PermissionProvider iri={currentCollection.ownerWorkspace}>
            <PermissionContext.Consumer>
                {({permissions}) => (
                    <AlterPermissionDialog
                        {...props}
                        collaborators={collaborators}
                        users={permissions}
                        collections={collections}
                        loading={loadingPermissions}
                        error={errorPermissions}
                    />
                )}
            </PermissionContext.Consumer>
        </PermissionProvider>
    );
};

export default AlterPermissionContainer;
