import React from "react";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {getLabel, relativeLink} from "../../utils/metadataUtils";
import * as metadataActions from "../../actions/metadataActions";
import NewMetadataEntityDialog from "./NewMetadataEntityDialog";
import {ErrorDialog, ErrorMessage, LoadingInlay, LoadingOverlay} from "../common";
import MetaList from './MetaList';
import {getVocabulary} from "../../selectors/vocabularySelectors";

class MetadataListContainer extends React.Component {
    state = {
        creatingMetadataEntity: false
    };

    componentDidMount() {
        this.props.fetchAllEntitiesIfNeeded();
    }

    handleEntityCreation = (shape, id) => {
        this.setState({creatingMetadataEntity: true})

        this.props.createMetadataEntity(shape, id)
            .then((res) => {
                this.props.fetchAllEntitiesIfNeeded();
                this.props.history.push(relativeLink(res.value));
                this.setState({creatingMetadataEntity: false})
            })
            .catch(e => {
                ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`);
                this.setState({creatingMetadataEntity: false});
            });
    }

    render() {
        const {loading, error, entities} = this.props;

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
                <LoadingOverlay loading={this.state.creatingMetadataEntity} />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    const {cache: {allEntities}} = state;
    const allEntitiesData = allEntities && allEntities.data ? allEntities.data : [];
    const vocabularyData = getVocabulary(state);
    const entities = allEntitiesData.map(e => ({
        id: e['@id'],
        label: getLabel(e),
        type: e['@type'],
        typeLabel: getLabel(vocabularyData.determineShapeForType(e['@type'][0]), true)
    }));

    return ({
        loading: allEntities ? allEntities.pending : true,
        error: allEntities ? allEntities.error : false,
        entities
    });
};

const mapDispatchToProps = {
    ...metadataActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MetadataListContainer));
