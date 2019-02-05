import React from "react";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {
    Table, Paper, TableHead, TableRow,
    TableCell, TableBody
} from "@material-ui/core";

import {getLabel, navigableLink, relativeLink} from "../../utils/metadataUtils";
import * as metadataActions from "../../actions/metadataActions";
import NewMetadataEntityDialog from "./NewMetadataEntityDialog";
import {ErrorMessage, ErrorDialog, LoadingInlay, LoadingOverlay} from "../common";

class MetadataEntities extends React.Component {
    componentDidMount() {
        this.props.fetchAllEntitiesIfNeeded();
    }

    handleEntityCreation = (type, id) => {
        this.props.createMetadataEntity(type, id)
            .then((res) => {
                this.props.fetchAllEntitiesIfNeeded();
                this.props.history.push(relativeLink(res.value));
            })
            .catch(e => ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`));
    }

    render() {
        const {
            loading, creatingMetadataEntity, error, entities, vocabulary
        } = this.props;

        if (loading) {
            return <LoadingInlay />;
        } if (error) {
            return <ErrorMessage message="An error occurred while loading metadata" />;
        }

        return (
            <>
                <NewMetadataEntityDialog onCreate={this.handleEntityCreation} />
                <Paper>
                    <Table style={{marginBottom: 300}}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Label</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>URI</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {entities ? entities.map(entity => (
                                <TableRow key={entity['@id']}>
                                    <TableCell>
                                        {getLabel(entity)}
                                    </TableCell>
                                    <TableCell>
                                        {entity['@type'].map(type => (
                                            <a href={navigableLink(type)} key={type}>
                                                {getLabel(vocabulary.getById(type), true)}
                                            </a>
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        <a href={navigableLink(entity['@id'])}>
                                            {getLabel(entity)}
                                        </a>
                                    </TableCell>
                                </TableRow>
                            )) : null}
                        </TableBody>
                    </Table>
                </Paper>

                <LoadingOverlay loading={creatingMetadataEntity} />
            </>
        );
    }
}

const mapStateToProps = state => ({
    loading: state.cache.allEntities ? state.cache.allEntities.pending : true,
    error: state.cache.allEntities ? state.cache.allEntities.error : false,
    entities: state.cache.allEntities ? state.cache.allEntities.data : [],
    vocabulary: state.cache.vocabulary ? state.cache.vocabulary.data : undefined,
    creatingMetadataEntity: state.metadataBySubject.creatingMetadataEntity
});

const mapDispatchToProps = {
    ...metadataActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MetadataEntities));
