import React from 'react';
import {Paper} from '@material-ui/core';

import BreadCrumbs from "../common/BreadCrumbs";
import MetadataEntityHeader from './MetadataEntityHeader';
import MetadataEntityContainer from './MetadataEntityContainer';

const metadataEntityPage = () => (
    <>
        <BreadCrumbs homeUrl="/metadata" />
        <MetadataEntityHeader subject={window.location.href} />
        <Paper style={{paddingLeft: 20}}>
            <MetadataEntityContainer
                editable
                subject={window.location.href}
            />
        </Paper>
    </>
);

export default metadataEntityPage;
