import React from 'react';
import asPage from "../../containers/asPage/asPage";
import BreadCrumbs from "../../components/generic/BreadCrumbs/BreadCrumbs";
import EntityInformation from '../../components/metadata/EntityInformation';
import metadataAPI from '../../services/MetadataAPI/MetadataAPI';
import Metadata from '../../components/metadata/Metadata';
import {Paper} from '@material-ui/core';

export class MetadataEntityPage extends React.Component {

    render() {
        const {match: {params}} = this.props;
        const subject = `${window.location.origin}/iri/${params.type}/${params.id}`;
        return (
            <div>
                <BreadCrumbs/>
                <EntityInformation id={params.id} type={params.type}/>
                <Paper style={{paddingLeft: 20}}>
                    <Metadata
                        editable={true}
                        metadataAPI={metadataAPI}
                        subject={subject}/>
                </Paper>
            </div>
        );
    }
}

export default asPage(MetadataEntityPage);
