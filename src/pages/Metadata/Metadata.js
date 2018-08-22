import React from 'react';
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import * as MetadataComponent from '../../components/metadata/Metadata';
import metadataStore from "../../services/MetadataStore/MetadataStore";

function Metadata(props) {
    const {match: { params }} = props;

    return (
        <div>
            <Typography noWrap>{'Metadata'}</Typography>
            <List>
                <ListItem>Type: {params.type}</ListItem>
                <ListItem>Id: {params.id}</ListItem>
            </List>

            <MetadataComponent
                metadataStore={metadataStore}
                subject={`${window.location.origin}/iri/${params.type}/${params.id}`}
            />
        </div>
    );
}

export default (Metadata);



