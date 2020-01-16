import React, {useContext, useState} from 'react';
import {Button, Grid, Paper} from '@material-ui/core';

import LinkedDataMetadataProvider from '../metadata/LinkedDataMetadataProvider';
import LinkedDataEntityForm from '../metadata/common/LinkedDataEntityForm';
import useLinkedData from '../metadata/UseLinkedData';
import {PROJECT_INFO_URI} from '../constants';
import LinkedDataEntityFormContainer from '../metadata/common/LinkedDataEntityFormContainer';
import LinkedDataContext from '../metadata/LinkedDataContext';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';

const ProjectInfoWithProvider = () => (
    <LinkedDataMetadataProvider>
        <ProjectInfo />
    </LinkedDataMetadataProvider>
);

const ProjectInfo = () => {
    const {isCoordinator} = useContext(LinkedDataContext);
    const {properties, values, linkedDataLoading, linkedDataError, updateLinkedData} = useLinkedData(PROJECT_INFO_URI);
    const [editingEnabled, setEditingEnabled] = useState(false);

    return (
        <>
            <Paper style={{padding: 20}}>
                {isCoordinator ? (
                    <Grid container direction="row">
                        <Grid item xs={11}>
                            <LinkedDataEntityFormContainer
                                subject={PROJECT_INFO_URI}
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
                        <Grid item xs={1}>
                            {editingEnabled ?
                                <Button onClick={() => setEditingEnabled(false)}>Cancel</Button> :
                                <IconButton aria-label="Edit" onClick={() => setEditingEnabled(true)}><Icon>edit</Icon></IconButton>
                            }
                        </Grid>
                    </Grid>
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

export default ProjectInfoWithProvider;
