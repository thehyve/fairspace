import React from 'react';
import {Paper} from '@material-ui/core';
import BreadCrumbs from "../../components/generic/BreadCrumbs/BreadCrumbs";
import EntityInformation from '../../components/metadata/EntityInformation';
import Metadata from '../../components/metadata/Metadata';

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
