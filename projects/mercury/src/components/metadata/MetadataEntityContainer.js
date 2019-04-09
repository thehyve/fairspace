import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Fab, Grid, List, Paper} from '@material-ui/core';

import {ErrorMessage, LoadingInlay} from "../common";
import * as metadataActions from "../../actions/metadataActions";
import * as vocabularyActions from "../../actions/vocabularyActions";
import {isDateTimeProperty, linkLabel, propertiesToShow, url2iri} from "../../utils/metadataUtils";
import {getCombinedMetadataForSubject, hasMetadataError, isMetadataPending} from "../../reducers/cache/jsonLdBySubjectReducers";
import {hasVocabularyError, isVocabularyPending} from "../../reducers/cache/vocabularyReducers";
import ErrorDialog from "../common/ErrorDialog";

import MetaEntityHeader from './common/MetaEntityHeader';
import MetadataProperty from "./MetadataProperty";

export class MetadataEntityContainer extends React.Component {
    state = {
        propertiesWithUpdatedValues: {}
    };

    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps) {
        if (this.props.subject !== prevProps.subject) {
            this.resetChanges();
            this.load();
        } else if (this.anyPendingChanges()) {
            this.load();
        }
    }

    load() {
        const {subject, fetchMetadataVocabularyIfNeeded, fetchMetadataBySubjectIfNeeded} = this.props;

        if (subject) {
            fetchMetadataVocabularyIfNeeded();
            fetchMetadataBySubjectIfNeeded(subject);
        }
    }

    updateState = (propertyKey, updatedValues) => {
        this.setState(prevState => ({
            propertiesWithUpdatedValues:
                {...prevState.propertiesWithUpdatedValues, [propertyKey]: updatedValues}
        }));
    };

    handleChange = (property, value, index) => {
        const pendingValues = this.state.propertiesWithUpdatedValues[property.key];
        const values = pendingValues || property.values;
        const updatedValues = values.map((el, idx) => ((idx === index) ? value : el));
        this.updateState(property.key, updatedValues);
    };

    handleAdd = (property, value) => {
        const updatedValues = [...property.values, value];
        this.updateState(property.key, updatedValues);
    };

    handleDelete = (property, index) => {
        const pendingValues = this.state.propertiesWithUpdatedValues[property.key];
        const values = pendingValues || property.values;
        const updatedValues = values.filter((el, idx) => idx !== index);
        this.updateState(property.key, updatedValues);
    };

    handleSubmit = () => {
        const {subject, updateEntity} = this.props;

        updateEntity(subject, this.state.propertiesWithUpdatedValues)
            .then(this.resetChanges)
            .catch(e => ErrorDialog.showError(e, "Error while updating metadata"));
    };

    anyPendingChanges = () => Object.keys(this.state.propertiesWithUpdatedValues).length !== 0;

    shouldShowSubmitButton = () => this.props.editable && this.anyPendingChanges();

    resetChanges = () => {
        this.setState({propertiesWithUpdatedValues: {}});
    }

    render() {
        const {
            subject, label, typeInfo, properties, editable, error, loading, showHeader
        } = this.props;
        const submitButtonVisibility = this.shouldShowSubmitButton() ? 'visible' : 'hidden';

        if (error) {
            return <ErrorMessage message={error.message} />;
        }

        if (loading) {
            return <LoadingInlay />;
        }

        const propertiesWithChanges = properties.map(p => ({
            ...p,
            values: this.state.propertiesWithUpdatedValues[p.key] || p.values
        }));

        const entity = (
            <Grid>
                <Fab
                    variant="extended"
                    onClick={this.handleSubmit}
                    color="primary"
                    style={{visibility: submitButtonVisibility}}
                >
                    Update
                </Fab>
                <List dense>
                    {
                        propertiesWithChanges.map((p) => (
                            <MetadataProperty
                                editable={editable && p.editable}
                                subject={subject}
                                key={subject + p.key}
                                property={p}
                                onChange={(value, index) => this.handleChange(p, value, index)}
                                onAdd={(value) => this.handleAdd(p, value)}
                                onDelete={(index) => this.handleDelete(p, index)}
                            />
                        ))
                    }
                </List>
            </Grid>
        );

        return showHeader ? (
            <>
                <MetaEntityHeader label={label} typeInfo={typeInfo} />
                <Paper style={{paddingLeft: 20}}>
                    {entity}
                </Paper>
            </>
        ) : entity;
    }
}
const mapStateToProps = (state, ownProps) => {
    const subject = ownProps.subject || url2iri(window.location.href);
    const metadata = getCombinedMetadataForSubject(state, subject);
    const hasNoMetadata = !metadata || metadata.length === 0;
    const hasOtherErrors = hasMetadataError(state, subject) || hasVocabularyError(state);
    const typeProp = metadata && metadata.find(prop => prop.key === '@type');
    const typeLabel = typeProp && typeProp.values && typeProp.values.length && typeProp.values[0].label;
    const comment = typeProp && typeProp.values && typeProp.values.length && typeProp.values[0].comment;
    const typeInfo = (typeLabel && comment) ? `${typeLabel} - ${comment}` : (typeLabel || comment);
    const label = linkLabel(subject);
    const error = hasNoMetadata || hasOtherErrors ? 'An error occurred while loading metadata.' : '';
    const editable = Object.prototype.hasOwnProperty.call(ownProps, "editable") ? ownProps.editable : true;
    const properties = hasNoMetadata ? [] : propertiesToShow(metadata)
        .map(p => ({
            ...p,
            editable: editable && !isDateTimeProperty(p)
        }));

    return {
        loading: isMetadataPending(state, subject) || isVocabularyPending(state),
        properties,
        subject,
        typeInfo,
        label,
        error,
        showHeader: ownProps.showHeader || false,
        editable,
    };
};

const mapDispatchToProps = {
    fetchMetadataVocabularyIfNeeded: vocabularyActions.fetchMetadataVocabularyIfNeeded,
    fetchMetadataBySubjectIfNeeded: metadataActions.fetchMetadataBySubjectIfNeeded,
    updateEntity: metadataActions.updateEntity
};

MetadataEntityContainer.propTypes = {
    updateEntity: PropTypes.func.isRequired,
    fetchMetadataVocabularyIfNeeded: PropTypes.func,
    fetchMetadataBySubjectIfNeeded: PropTypes.func
}

MetadataEntityContainer.defaultProps = {
    fetchMetadataVocabularyIfNeeded: () => {},
    fetchMetadataBySubjectIfNeeded: () => {}
};

export default connect(mapStateToProps, mapDispatchToProps)(MetadataEntityContainer);
