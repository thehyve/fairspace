import React from 'react';
import {Paper} from '@material-ui/core';

import LinkedDataMetadataProvider from '../metadata/LinkedDataMetadataProvider';
import LinkedDataEntityForm from '../metadata/common/LinkedDataEntityForm';
import useLinkedData from '../metadata/common/UseLinkedData';
import LinkedDataEntityFormContainer from '../metadata/common/LinkedDataEntityFormContainer';

const WorkspaceInfoWithProvider = (props) => (
    <LinkedDataMetadataProvider>
        <WorkspaceInfo {...props} />
    </LinkedDataMetadataProvider>
);

const WorkspaceInfo = (props) => {
    const {workspace} = props;
    const {iri} = workspace;
    const {properties, values, linkedDataLoading, linkedDataError, updateLinkedData} = useLinkedData(iri);

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
