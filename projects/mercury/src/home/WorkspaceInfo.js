import React, {useContext} from 'react';
import {Paper} from '@material-ui/core';

import LinkedDataMetadataProvider from '../metadata/LinkedDataMetadataProvider';
import LinkedDataEntityForm from '../metadata/common/LinkedDataEntityForm';
import useLinkedData from '../metadata/UseLinkedData';
import {WORKSPACE_INFO} from '../constants';
import LinkedDataEntityFormContainer from '../metadata/common/LinkedDataEntityFormContainer';
import LinkedDataContext from '../metadata/LinkedDataContext';


const WorkspaceInfoWithProvider = () => (
    <LinkedDataMetadataProvider>
        <WorkspaceInfo />
    </LinkedDataMetadataProvider>
);

const WorkspaceInfo = () => {
    const {isCoordinator} = useContext(LinkedDataContext);
    const {properties, values, linkedDataLoading, linkedDataError, updateLinkedData} = useLinkedData(WORKSPACE_INFO);

    return (
        <Paper style={{maxWidth: 800, padding: 20}}>
            {isCoordinator ? (
                <LinkedDataEntityFormContainer
                    subject={WORKSPACE_INFO}
                    editable
                    properties={properties}
                    values={values}
                    linkedDataLoading={linkedDataLoading}
                    linkedDataError={linkedDataError}
                    updateLinkedData={updateLinkedData}
                />
            ) : (
                <LinkedDataEntityForm
                    editable={false}
                    error={linkedDataError}
                    loading={linkedDataLoading}
                    properties={properties}
                    values={values}
                />
            )}
        </Paper>
    );
};

export default WorkspaceInfoWithProvider;
