import React from 'react';
import {connect} from 'react-redux';
import {Paper, List, Fab, Grid} from '@material-ui/core';

import {ErrorMessage, LoadingInlay} from "../common";
import * as metadataActions from "../../actions/metadataActions";
import MetaEntityHeader from './MetaEntityHeader';
import {isDateTimeProperty, propertiesToShow, linkLabel, url2iri} from "../../utils/metadataUtils";

import MetadataProperty from "./MetadataProperty";
import ErrorDialog from "../common/ErrorDialog";

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
        const {subject, fetchCombinedMetadataIfNeeded} = this.props;

        if (subject) {
            fetchCombinedMetadataIfNeeded(subject);
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
            .catch(e => ErrorDialog.showError(e, "Error while updateing metadata"));
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
    const {metadataBySubject, cache: {vocabulary}} = state;
    const subject = ownProps.subject || url2iri(window.location.href);
    const metadata = metadataBySubject[subject] || {};
    const hasNoMetadata = !metadata || !metadata.data || metadata.data.length === 0;
    const hasOtherErrors = (metadata && metadata.error) || !vocabulary || vocabulary.error;
    const typeProp = metadata && metadata.data && metadata.data.find(prop => prop.key === '@type');
    const typeLabel = typeProp && typeProp.values && typeProp.values.length && typeProp.values[0].label;
    const comment = typeProp && typeProp.values && typeProp.values.length && typeProp.values[0].comment;
    const typeInfo = (typeLabel && comment) ? `${typeLabel} - ${comment}` : (typeLabel || comment);
    const label = linkLabel(subject);
    const error = hasNoMetadata || hasOtherErrors ? 'An error occurred while loading metadata.' : '';
    const editable = Object.prototype.hasOwnProperty.call(ownProps, "editable") ? ownProps.editable : true;
    const properties = hasNoMetadata ? [] : propertiesToShow(metadata.data)
        .map(p => ({
            ...p,
            editable: editable && !isDateTimeProperty(p)
        }));

    return {
        loading: metadata.pending || (vocabulary && vocabulary.pending),
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
    ...metadataActions
};

MetadataEntityContainer.defaultProps = {
    fetchCombinedMetadataIfNeeded: () => {}
};

export default connect(mapStateToProps, mapDispatchToProps)(MetadataEntityContainer);
