import React from 'react';
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import metadataAPI from "../../services/MetadataAPI/MetadataAPI";
import Metadata from '../../components/metadata/Metadata';
import asPage from "../../containers/asPage/asPage";

function MetadataEntityPage(props) {
    const {match: { params }} = props;

    return (
        <div>
            <Typography noWrap>{'Metadata'}</Typography>
            <List>
                <ListItem>Id: {params.id}</ListItem>
            </List>

            <Metadata
                editable={true}
                metadataAPI={metadataAPI}
                subject={`${window.location.origin}/iri/${params.type}/${params.id}`}
            />
        </div>
    );
}

export default asPage(MetadataEntityPage);



