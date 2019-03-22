import React from "react";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {getLabel, relativeLink} from "../../utils/metadataUtils";
import * as metadataActions from "../../actions/metadataActions";
import NewMetadataEntityDialog from "./NewMetadataEntityDialog";
import {ErrorDialog, ErrorMessage, LoadingInlay, LoadingOverlay} from "../common";
import MetaList from './MetaList';

class MetadataListContainer extends React.Component {
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
        const {loading, creatingMetadataEntity, error, entities} = this.props;

        if (loading) {
            return <LoadingInlay />;
        }

        if (error) {
            return <ErrorMessage message="An error occurred while loading metadata" />;
        }

        return (
            <>
                <NewMetadataEntityDialog onCreate={this.handleEntityCreation} />
                {entities && entities.length > 0 ? <MetaList items={entities} /> : null}
                <LoadingOverlay loading={creatingMetadataEntity} />
            </>
        );
    }
}

const mapStateToProps = ({metadataBySubject, cache: {allEntities, vocabulary}}) => {
    const allEntitiesData = allEntities && allEntities.data ? allEntities.data : [];
    const vocabularyData = vocabulary ? vocabulary.data : undefined;
    const entities = allEntitiesData.map(e => ({
        id: e['@id'],
        label: getLabel(e),
        type: e['@type'],
        typeLabel: getLabel(vocabularyData.getById(e['@type']), true)
    }));

    return ({
        loading: allEntities ? allEntities.pending : true,
        error: allEntities ? allEntities.error : false,
        entities,
        creatingMetadataEntity: metadataBySubject.creatingMetadataEntity
    });
};

const mapDispatchToProps = {
    ...metadataActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MetadataListContainer));
