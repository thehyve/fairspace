import connect from 'react-redux/es/connect/connect';
import List from '@material-ui/core/List/List';
import ListItem from '@material-ui/core/ListItem/ListItem';
import Metadata from './Metadata';
import metadataAPI from '../../services/MetadataAPI/MetadataAPI';
import React from 'react';

export class EntityInformation extends React.Component {

    render() {
        return (
            <div>
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

export default connect(mapStateToProps)(EntityInformation)
