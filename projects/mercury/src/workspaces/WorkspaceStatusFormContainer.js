// @flow
import React from 'react';
import {WORKSPACE_STATUS_URI} from "../constants";
import useLinkedData from "../metadata/common/UseLinkedData";
import LinkedDataMetadataProvider from "../metadata/LinkedDataMetadataProvider";
import LinkedDataEntityFormContainer from "../metadata/common/LinkedDataEntityFormContainer";

const WorkspaceStatusFormContainer = ({workspaceIri, refreshWorkspaces}) => {
    const {properties, values, linkedDataLoading, linkedDataError, updateLinkedData} = useLinkedData(workspaceIri);
    const statusProperty = properties.find(p => p.key === WORKSPACE_STATUS_URI);

    return (
        <>
            {statusProperty && (
                <LinkedDataEntityFormContainer
                    subject={workspaceIri}
                    properties={[statusProperty]}
                    values={values}
                    isMetaDataEditable
                    showEditButtons
                    linkedDataLoading={linkedDataLoading}
                    linkedDataError={linkedDataError}
                    updateLinkedData={() => updateLinkedData().then(() => refreshWorkspaces())}
                />
            )}
        </>
    );
};

const WorkspaceStatusFormContainerWithProvider = (props) => (
    <LinkedDataMetadataProvider>
        <WorkspaceStatusFormContainer {...props} />
    </LinkedDataMetadataProvider>
);

export default WorkspaceStatusFormContainerWithProvider;
