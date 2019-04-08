import React from "react";
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {getLabel, relativeLink} from "../../utils/metadataUtils";
import * as metadataActions from "../../actions/metadataActions";
import NewMetadataEntityDialog from "../metadata/NewMetadataEntityDialog";
import {ErrorDialog, ErrorMessage, LoadingInlay, LoadingOverlay} from "../common";
import MetaList from '../metadata/MetaList';
import {getVocabulary, hasVocabularyError, isVocabularyPending} from "../../selectors/vocabularySelectors";
import {
    getMetaVocabulary,
    hasMetaVocabularyError,
    isMetaVocabularyPending
} from "../../selectors/metaVocabularySelectors";

class VocabularyListContainer extends React.Component {
    state = {
        creating: false
    }

    componentDidMount() {
        this.props.fetchVocabularyIfNeeded();
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
                <NewMetadataEntityDialog onCreate={this.handleEntityCreation} />
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
    fetchVocabularyIfNeeded: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    const vocabulary = getVocabulary(state);
    const metaVocabulary = getMetaVocabulary(state);

    const entities = vocabulary.vocabulary.map(e => ({
        id: e['@id'],
        label: getLabel(e),
        type: e['@type'],
        typeLabel: getLabel(metaVocabulary.determineShapeForType(e['@type'][0]), true)
    }));

    return ({
        loading: isVocabularyPending(state) || isMetaVocabularyPending(state),
        error: hasVocabularyError(state) || hasMetaVocabularyError(state),
        entities
    });
};


const mapDispatchToProps = {
    createVocabularyEntity: metadataActions.createVocabularyEntity,
    fetchVocabularyIfNeeded: metadataActions.fetchMetadataVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(VocabularyListContainer));
