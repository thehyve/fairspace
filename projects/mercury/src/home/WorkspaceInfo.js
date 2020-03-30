import React from 'react';
import {Paper} from '@material-ui/core';

import LinkedDataMetadataProvider from '../metadata/LinkedDataMetadataProvider';
import LinkedDataEntityForm from '../metadata/common/LinkedDataEntityForm';
import useLinkedData from '../metadata/UseLinkedData';
import LinkedDataEntityFormContainer from '../metadata/common/LinkedDataEntityFormContainer';
import {LoadingInlay} from "../common";

const WorkspaceInfoWithProvider = (props) => (
    <LinkedDataMetadataProvider>
        <WorkspaceInfo {...props} />
    </LinkedDataMetadataProvider>
);

const WorkspaceInfo = (props) => {
    const {workspace, workspacesLoading, workspacesError} = props;
    const iri = workspace && workspace.iri;
    const {properties, values, linkedDataLoading, linkedDataError, updateLinkedData} = useLinkedData(iri);
    if (workspacesLoading) {
        return (<LoadingInlay />);
    }
    if (workspacesError || !iri) {
        return 'Error loading workspaces';
    }
    const {canManage} = workspace; // TODO or is admin
    return (
        <>
            <Paper style={{padding: 20}}>
                {canManage ? (
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
