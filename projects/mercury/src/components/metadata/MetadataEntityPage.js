import React from 'react';
import {Paper} from '@material-ui/core';
import BreadCrumbs from "../common/BreadCrumbs";
import EntityInformation from './EntityInformation';
import Metadata from './Metadata';

const metadataEntityPage = () => (
    <>
        <BreadCrumbs homeUrl="/metadata" />
        <EntityInformation subject={window.location.href} />
        <Paper style={{paddingLeft: 20}}>
            <Metadata
                editable
                subject={window.location.href}
            />
        </Paper>
    </>
);

export default metadataEntityPage;
