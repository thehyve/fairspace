import React from 'react';
import LinkedDataMetadataProvider from '../metadata/LinkedDataMetadataProvider';
import LinkedDataEntityForm from '../metadata/common/LinkedDataEntityForm';
import useLinkedData from '../metadata/UseLinkedData';
import {WORKSPACE_INFO} from '../constants';


const WorkspaceInfoWithProvider = () => (
    <LinkedDataMetadataProvider>
        <WorkspaceInfo />
    </LinkedDataMetadataProvider>
);

const WorkspaceInfo = () => {
    const {properties, values, linkedDataLoading, linkedDataError} = useLinkedData(WORKSPACE_INFO);

    return (
        <LinkedDataEntityForm
            editable
            error={linkedDataError}
            loading={linkedDataLoading}
            properties={properties}
            values={values}
        />
    );
};

export default WorkspaceInfoWithProvider;
