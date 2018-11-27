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
    let labelProp = undefined;
    let commentProp = undefined;
    if (state['metadataBySubject'] &&
        state['metadataBySubject'][subject] &&
        state['metadataBySubject'][subject]['data']) {
        const data = state['metadataBySubject'][subject]['data'];
        labelProp = data.find(prop => {
            return prop.key === LABEL_URI;
        });
        commentProp = data.find(prop => {
            return prop.key === COMMENT_URI;
        });
    }

    const label = labelProp && labelProp.values && labelProp.values[0] ?
        labelProp.values[0] : undefined;

    const comment = commentProp && commentProp.values && commentProp.values[0] ?
        commentProp.values[0] : undefined;

    return {
        subject: subject,
        id: params.id,
        label: label,
        comment: comment
    };
}

export default connect(mapStateToProps)(asPage(MetadataEntityPage));



