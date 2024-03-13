import React, {useContext} from 'react';
import {Paper} from '@mui/material';

import LinkedDataMetadataProvider from '../metadata/LinkedDataMetadataProvider';
import LinkedDataEntityForm from '../metadata/common/LinkedDataEntityForm';
import useLinkedData from '../metadata/common/UseLinkedData';
import LinkedDataEntityFormContainer from '../metadata/common/LinkedDataEntityFormContainer';
import WorkspaceActionMenu from './WorkspaceActionMenu';
import {isAdmin} from '../users/userUtils';
import UserContext from '../users/UserContext';
import type {Workspace} from './WorkspacesAPI';
import WorkspaceContext from './WorkspaceContext';

type WorkspaceInfoProps = {
    workspace: Workspace
};

const WorkspaceInfo = (props: WorkspaceInfoProps) => {
    const {workspace} = props;
    const {iri} = workspace;
    const {typeInfo, properties, values, linkedDataLoading, linkedDataError, updateLinkedData} =
        useLinkedData(iri);
    const {currentUser} = useContext(UserContext);
    const {refreshWorkspaces} = useContext(WorkspaceContext);

    const onUpdate = () => {
        updateLinkedData();
        refreshWorkspaces();
    };

    const contextMenu = isAdmin(currentUser) ? <WorkspaceActionMenu workspace={workspace} /> : null;

    return (
        <>
            <Paper style={{padding: 20, overflowX: 'auto'}}>
                {workspace.canManage ? (
                    <LinkedDataEntityFormContainer
                        subject={iri}
                        typeInfo={typeInfo}
                        properties={properties}
                        values={values}
                        isMetaDataEditable
                        showEditButtons
                        contextMenu={contextMenu}
                        linkedDataLoading={linkedDataLoading}
                        linkedDataError={linkedDataError}
                        updateLinkedData={onUpdate}
                    />
                ) : (
                    <LinkedDataEntityForm
                        hasEditRight={false}
                        editable={false}
                        errorMessage={linkedDataError}
                        loading={linkedDataLoading}
                        properties={properties}
                        values={values}
                        typeIri={typeInfo.typeIri}
                    />
                )}
            </Paper>
        </>
    );
};

const WorkspaceInfoWithProvider = props => (
    <LinkedDataMetadataProvider>
        <WorkspaceInfo {...props} />
    </LinkedDataMetadataProvider>
);
export default WorkspaceInfoWithProvider;
