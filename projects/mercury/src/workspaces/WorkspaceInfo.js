import React, {useContext} from 'react';
import {Paper} from '@material-ui/core';

import LinkedDataMetadataProvider from '../metadata/LinkedDataMetadataProvider';
import LinkedDataEntityForm from '../metadata/common/LinkedDataEntityForm';
import useLinkedData from '../metadata/common/UseLinkedData';
import LinkedDataEntityFormContainer from '../metadata/common/LinkedDataEntityFormContainer';
import WorkspaceActionMenu from './WorkspaceActionMenu';
import {isAdmin} from '../users/userUtils';
import UserContext from '../users/UserContext';
import type {Workspace} from './WorkspacesAPI';

const WorkspaceInfoWithProvider = (props) => (
    <LinkedDataMetadataProvider>
        <WorkspaceInfo {...props} />
    </LinkedDataMetadataProvider>
);

type WorkspaceInfoProps = {
    workspace: Workspace;
}

const WorkspaceInfo = (props: WorkspaceInfoProps) => {
    const {workspace} = props;
    const {iri} = workspace;
    const {properties, values, linkedDataLoading, linkedDataError, updateLinkedData} = useLinkedData(iri);
    const {currentUser} = useContext(UserContext);

    const contextMenu = isAdmin(currentUser) ? <WorkspaceActionMenu workspace={workspace} onUpdate={updateLinkedData} /> : null;

    return (
        <>
            <Paper style={{padding: 20}}>
                {workspace.canManage ? (
                    <LinkedDataEntityFormContainer
                        subject={iri}
                        properties={properties}
                        values={values}
                        isMetaDataEditable
                        showEditButtons
                        contextMenu={contextMenu}
                        linkedDataLoading={linkedDataLoading}
                        linkedDataError={linkedDataError}
                        updateLinkedData={updateLinkedData}
                    />
                ) : (
                    <LinkedDataEntityForm
                        hasEditRight={false}
                        editable={false}
                        errorMessage={linkedDataError}
                        loading={linkedDataLoading}
                        properties={properties}
                        values={values}
                    />
                )}
            </Paper>
        </>
    );
};

export default WorkspaceInfoWithProvider;
