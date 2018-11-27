import connect from 'react-redux/es/connect/connect';
import Metadata from './Metadata';
import metadataAPI from '../../services/MetadataAPI/MetadataAPI';
import React from 'react';
import Table from '@material-ui/core/es/Table/Table';
import TableRow from '@material-ui/core/es/TableRow/TableRow';
import TableCell from '@material-ui/core/es/TableCell/TableCell';

export class EntityInformation extends React.Component {

    render() {
        const {id, label, comment, subject} = this.props;
        return (
            <div>
                <Table>
                    <TableRow>
                        <TableCell>Id: </TableCell> <TableCell>{id}</TableCell>
                    </TableRow>
                    {
                        label ?
                            <TableRow>
                                <TableCell>Type: </TableCell> <TableCell>{label}</TableCell>
                            </TableRow> : ''
                    }
                    {
                        comment ?
                            <TableRow>
                                <TableCell>Description: </TableCell> <TableCell>{comment}</TableCell>
                            </TableRow> : ''
                    }

                </Table>

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
