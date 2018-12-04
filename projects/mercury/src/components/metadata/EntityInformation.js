import {connect} from 'react-redux';
import React from 'react';
import {Table, Paper} from "@material-ui/core";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

export class EntityInformation extends React.Component {

    render() {
        const {id, label, comment} = this.props;
        return (
            <Paper>
                <Table>
                    <TableRow>
                        <TableCell>Id:</TableCell> <TableCell>{id}</TableCell>
                    </TableRow>
                    {
                        label ?
                            <TableRow>
                                <TableCell>Type:</TableCell> <TableCell>{label}</TableCell>
                            </TableRow> : ''
                    }
                    {
                        comment ?
                            <TableRow>
                                <TableCell>Description:</TableCell> <TableCell>{comment}</TableCell>
                            </TableRow> : ''
                    }

                </Table>
            </Paper>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const {metadataBySubject} = state;
    const {id, type} = ownProps;
    const subject = `${window.location.origin}/iri/${type}/${id}`;
    let typeProp = undefined;
    if (metadataBySubject &&
        metadataBySubject[subject] &&
        metadataBySubject[subject]['data']) {
        const data = metadataBySubject[subject]['data'];
        typeProp = data.find(prop => {
            return prop.key === '@type';
        });
    }

    const label = typeProp && typeProp.values && typeProp.values.length && typeProp.values[0].label;
    const comment = typeProp && typeProp.values && typeProp.values.length && typeProp.values[0].comment;

    return {
        id: id,
        label: label,
        comment: comment
    };
}

export default connect(mapStateToProps)(EntityInformation)
