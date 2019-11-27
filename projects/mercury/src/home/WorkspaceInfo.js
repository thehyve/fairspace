import React, {useContext, useState} from 'react';
import {Paper, IconButton, Menu, MenuItem, Grid} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

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
    const [anchorEl, setAnchorEl] = useState();
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
                            updateLinkedData={updateLinkedData}
                        />
                    </Grid>
                    {
                        !editingEnabled && (
                            <Grid item>
                                <IconButton
                                    aria-label="More"
                                    aria-owns={anchorEl ? 'long-menu' : undefined}
                                    aria-haspopup="true"
                                    onClick={(e) => setAnchorEl(e.currentTarget)}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    id="simple-menu"
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={() => setAnchorEl(null)}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            setEditingEnabled(true);
                                            setAnchorEl(null);
                                        }}
                                    >
                                        Edit Information
                                    </MenuItem>
                                </Menu>
                            </Grid>
                        )
                    }
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
