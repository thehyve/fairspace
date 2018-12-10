import React from 'react';
import asPage from "../../containers/asPage/asPage";
import BreadCrumbs from "../../components/generic/BreadCrumbs/BreadCrumbs";
import EntityInformation from '../../components/metadata/EntityInformation';
import Metadata from '../../components/metadata/Metadata';
import {Paper} from '@material-ui/core';

export class MetadataEntityPage extends React.Component {

    render() {
        return (
            <div>
                <BreadCrumbs/>
                <EntityInformation subject={window.location.href}/>
                <Paper style={{paddingLeft: 20}}>
                    <Metadata
                        editable={true}
                        subject={window.location.href}/>
                </Paper>
            </div>
        );
    }
}

export default asPage(MetadataEntityPage);
