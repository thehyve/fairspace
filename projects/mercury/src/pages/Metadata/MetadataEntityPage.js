import React from 'react';
import {Paper} from '@material-ui/core';
import asPage from "../../containers/asPage/asPage";
import BreadCrumbs from "../../components/generic/BreadCrumbs/BreadCrumbs";
import EntityInformation from '../../components/metadata/EntityInformation';
import Metadata from '../../components/metadata/Metadata';

const metadataEntityPage = () => (
    <div>
        <BreadCrumbs homeUrl="/metadata" />
        <EntityInformation subject={window.location.href} />
        <Paper style={{paddingLeft: 20}}>
            <Metadata
                editable
                subject={window.location.href}
            />
        </Paper>
    </div>
);

export default asPage(metadataEntityPage);
