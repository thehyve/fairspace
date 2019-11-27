import React, {useContext, useState} from 'react';
import {Paper, Grid, Button} from '@material-ui/core';

import LinkedDataMetadataProvider from '../metadata/LinkedDataMetadataProvider';
import LinkedDataEntityForm from '../metadata/common/LinkedDataEntityForm';
import useLinkedData from '../metadata/UseLinkedData';
import {WORKSPACE_INFO_URI} from '../constants';
import LinkedDataEntityFormContainer from '../metadata/common/LinkedDataEntityFormContainer';
import LinkedDataContext from '../metadata/LinkedDataContext';

const WorkspaceInfoWithProvider = () => (
    <LinkedDataMetadataProvider>
        <WorkspaceInfo />
    </LinkedDataMetadataProvider>
);

const WorkspaceInfo = () => {
    const {isCoordinator} = useContext(LinkedDataContext);
    const {properties, values, linkedDataLoading, linkedDataError, updateLinkedData} = useLinkedData(WORKSPACE_INFO_URI);
    const [editingEnabled, setEditingEnabled] = useState(false);

    return (
        <Paper style={{maxWidth: 800, padding: 20}}>
            {isCoordinator ? (
                <Grid container direction="row">
                    <Grid item xs="11">
                        <LinkedDataEntityFormContainer
                            subject={WORKSPACE_INFO_URI}
                            editable={editingEnabled}
                            properties={properties}
                            values={values}
                            linkedDataLoading={linkedDataLoading}
                            linkedDataError={linkedDataError}
                            updateLinkedData={() => {
                                updateLinkedData()
                                    .then(() => setEditingEnabled(false));
                            }}
                        />
                    </Grid>
                    <Grid item xs="1">
                        <Button onClick={() => setEditingEnabled(prev => !prev)}>
                            {editingEnabled ? 'Cancel' : 'Edit'}
                        </Button>
                    </Grid>
                </Grid>
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
