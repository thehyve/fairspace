import React from 'react';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import metadataAPI from "../../services/MetadataAPI/MetadataAPI";
import Metadata from '../../components/metadata/Metadata';
import asPage from "../../containers/asPage/asPage";
import BreadCrumbs from "../../components/generic/BreadCrumbs/BreadCrumbs";
import connect from 'react-redux/es/connect/connect';
import {LABEL_URI, COMMENT_URI} from '../../services/MetadataAPI/MetadataAPI';

export class MetadataEntityPage extends React.Component {

    render() {
        return (
            <div>
                <BreadCrumbs/>

                <List>
                    <ListItem>Id: {this.props.id}</ListItem>
                    {
                        this.props.label ?
                            <ListItem>{this.props.label}</ListItem> : ''
                    }
                    {
                        this.props.comment ?
                            <ListItem>{this.props.comment}</ListItem> : ''
                    }
                </List>

                <Metadata
                    editable={true}
                    metadataAPI={metadataAPI}
                    subject={this.props.subject}
                />
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const {match: {params}} = ownProps;
    const subject = `${window.location.origin}/iri/${params.type}/${params.id}`;
    let typeProp = undefined;
    if (state['metadataBySubject'] &&
        state['metadataBySubject'][subject] &&
        state['metadataBySubject'][subject]['data']) {
        const data = state['metadataBySubject'][subject]['data'];
        typeProp = data.find(prop => {
            return prop.key === '@type';
        });
    }

    const label = typeProp && typeProp.values && typeProp.values[0] ?
        typeProp.values[0].label : undefined;

    const comment = typeProp && typeProp.values && typeProp.values[0] ?
        typeProp.values[0].comment : undefined;

    return {
        subject: subject,
        id: params.id,
        label: label,
        comment: comment
    };
}

export default connect(mapStateToProps)(asPage(MetadataEntityPage));



