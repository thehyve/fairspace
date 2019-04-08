import React from "react";
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {getLabel, relativeLink} from "../../../utils/metadataUtils";
import * as vocabularyActions from "../../../actions/vocabularyActions";
import {ErrorDialog, ErrorMessage, LoadingInlay, LoadingOverlay} from "../../common";
import MetaList from '../common/MetaList';
import {
    getVocabularyEntities,
    hasVocabularyEntitiesError,
    isVocabularyEntitiesPending
} from "../../../selectors/vocabularySelectors";
import {
    getMetaVocabulary,
    hasMetaVocabularyError,
    isMetaVocabularyPending
} from "../../../selectors/metaVocabularySelectors";
import NewVocabularyEntityDialog from "./NewVocabularyEntityDialog";

class VocabularyListContainer extends React.Component {
    state = {
        creating: false
    }

    componentDidMount() {
        this.props.fetchMetaVocabularyIfNeeded();
        this.props.fetchEntitiesIfNeeded();
    }

    handleEntityCreation = (shape, id) => {
        this.setState({creating: true});
        this.props.createVocabularyEntity(shape, id)
            .then((res) => {
                this.props.fetchVocabularyIfNeeded();
                this.props.history.push(relativeLink(res.value));
                this.setState({creating: false});
            })
            .catch(e => {
                ErrorDialog.showError(e, `Error creating a new vocabulary entity.\n${e.message}`);
                this.setState({creating: false});
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
                <NewVocabularyEntityDialog onCreate={this.handleEntityCreation} />
                {entities && entities.length > 0 ? <MetaList items={entities} /> : null}
                <LoadingOverlay loading={this.state.creating} />
            </>
        );
    }
}

VocabularyListContainer.propTypes = {
    loading: PropTypes.bool,
    entities: PropTypes.array,
    createVocabularyEntity: PropTypes.func.isRequired,
    fetchEntitiesIfNeeded: PropTypes.func.isRequired,
    fetchMetaVocabularyIfNeeded: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    const vocabularyEntities = getVocabularyEntities(state);
    const metaVocabulary = getMetaVocabulary(state);

    const entities = vocabularyEntities.map(e => ({
        id: e['@id'],
        label: getLabel(e),
        type: e['@type'],
        typeLabel: e['@type'] ? getLabel(metaVocabulary.determineShapeForType(e['@type'][0]), true) : ''
    }));

    return ({
        loading: isVocabularyEntitiesPending(state) || isMetaVocabularyPending(state),
        error: hasVocabularyEntitiesError(state) || hasMetaVocabularyError(state),
        entities
    });
};


const mapDispatchToProps = {
    createVocabularyEntity: vocabularyActions.createVocabularyEntity,
    fetchEntitiesIfNeeded: vocabularyActions.fetchAllVocabularyEntitiesIfNeeded,
    fetchMetaVocabularyIfNeeded: vocabularyActions.fetchMetaVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(VocabularyListContainer));
