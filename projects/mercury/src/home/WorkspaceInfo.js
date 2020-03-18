import React, {useContext} from 'react';
import {Paper} from '@material-ui/core';

import LinkedDataMetadataProvider from '../metadata/LinkedDataMetadataProvider';
import LinkedDataEntityForm from '../metadata/common/LinkedDataEntityForm';
import useLinkedData from '../metadata/UseLinkedData';
import LinkedDataEntityFormContainer from '../metadata/common/LinkedDataEntityFormContainer';
import LinkedDataContext from '../metadata/LinkedDataContext';
import WorkspaceContext from "../workspaces/WorkspaceContext";
import {currentWorkspace} from "../workspaces/workspaces";
import {LoadingInlay} from "../common";

const WorkspaceInfoWithProvider = () => (
    <LinkedDataMetadataProvider>
        <WorkspaceInfo />
    </LinkedDataMetadataProvider>
);

const WorkspaceInfo = () => {
    const {isCoordinator} = useContext(LinkedDataContext);
    const {workspaces, workspacesError, workspacesLoading} = useContext(WorkspaceContext);
    const id = currentWorkspace();
    const ws = workspaces.find(w => w.id === id);
    const iri = ws && ws.iri;
    const {properties, values, linkedDataLoading, linkedDataError, updateLinkedData} = useLinkedData(iri);
    if (workspacesLoading) {
        return (<LoadingInlay />);
    }
    if (workspacesError || !iri) {
        return 'Error loading workspaces';
    }
    return (
        <>
            <Paper style={{padding: 20}}>
                {isCoordinator ? (
                    <LinkedDataEntityFormContainer
                        subject={iri}
                        properties={properties}
                        values={values}
                        isMetaDataEditable
                        showEditButtons
                        linkedDataLoading={linkedDataLoading}
                        linkedDataError={linkedDataError}
                        updateLinkedData={updateLinkedData}
                    />
                ) : (
                    <LinkedDataEntityForm
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
