import React from 'react';
import {connect} from 'react-redux';
import {Paper, List, Button} from '@material-ui/core';

import {ErrorMessage, LoadingInlay} from "../common";
import * as metadataActions from "../../actions/metadataActions";
import MetaEntityHeader from './MetaEntityHeader';
import {isDateTimeProperty, propertiesToShow, linkLabel} from "../../utils/metadataUtils";

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
            this.load();
        }
    }

    load() {
        const {subject, fetchCombinedMetadataIfNeeded} = this.props;

        if (subject) {
            fetchCombinedMetadataIfNeeded(subject);
        }
    }

    handleChange = (property, value, index) => {
        // If index is 0 or larger then it's an update, otherwise it's addition
        if (index >= 0) {
            const currentEntry = property.values[index];

            if (currentEntry.value !== value) {
                const updatedValues = property.values.map((el, idx) => ((idx === index) ? {value} : el));
                this.updateState(property.key, updatedValues);
            }
        } else if (value || value.id) {
            const updatedValues = [...property.values, value];
            this.updateState(property.key, updatedValues);
        }
    };

    updateState = (key, updatedValues) => {
        this.setState(prevState => {
            const propertiesWithUpdatedValues = {...prevState.propertiesWithUpdatedValues};
            propertiesWithUpdatedValues[key] = updatedValues;
            return {propertiesWithUpdatedValues};
        });
    };

    handleDelete = (property, index) => {
        const {subject, updateMetadata} = this.props;
        const updatedValues = property.values.filter((el, idx) => idx !== index);

        return updateMetadata(subject, property.key, updatedValues)
            .catch(e => ErrorDialog.showError(e, "Error while deleting metadata"));
    };

    handleSubmit = () => {
        const {subject, updateMetadata} = this.props;
        const {propertiesWithUpdatedValues: values} = this.state;
        Object.keys(values).forEach(key => {
            updateMetadata(subject, key, values[key])
                .catch(e => ErrorDialog.showError(e, "Error while updating metadata"));
        });
    };

    render() {
        const {subject, label, typeInfo, properties, editable, error, loading, showHeader} = this.props;

        if (error) {
            return <ErrorMessage message={error.message} />;
        }

        if (loading) {
            return <LoadingInlay />;
        }

        const entity = (
            <List dense>
                {
                    properties.map((p) => (
                        <MetadataProperty
                            editable={editable && p.editable}
                            subject={subject}
                            key={p.key}
                            property={p}
                            onChange={(value, index) => this.handleChange(p, value, index)}
                            onDelete={(index) => this.handleDelete(p, index)}
                        />
                    ))
                }
            </List>
        );

        return showHeader ? (
            <>
                <MetaEntityHeader label={label} typeInfo={typeInfo} />
                <Button
                    onClick={this.handleSubmit}
                    color="primary"
                    disabled={Object.keys(this.state.propertiesWithUpdatedValues).length === 0}
                >
                    Update
                </Button>
                <Paper style={{paddingLeft: 20}}>
                    {entity}
                </Paper>
            </>
        ) : entity;
    }
}

const mapStateToProps = (state, ownProps) => {
    const {metadataBySubject, cache: {vocabulary}} = state;
    const subject = ownProps.subject || window.location.href;
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

export default connect(mapStateToProps, mapDispatchToProps)(MetadataEntityContainer);
