import React from 'react';
import {connect} from 'react-redux';
import {List, Paper} from '@material-ui/core';

import {ErrorMessage, LoadingInlay} from "../common";
import {fetchMetadataBySubjectIfNeeded} from "../../actions/metadataActions";
import {fetchMetadataVocabularyIfNeeded} from "../../actions/vocabularyActions";
import {getCombinedMetadataForSubject, hasMetadataError, isMetadataPending} from "../../selectors/metadataSelectors";
import {hasVocabularyError, isVocabularyPending} from "../../selectors/vocabularySelectors";
import {isDateTimeProperty, linkLabel, propertiesToShow, url2iri} from "../../utils/metadataUtils";

import MetaEntityHeader from './MetaEntityHeader';
import MetadataProperty from "./MetadataProperty";

export class MetadataEntityContainer extends React.Component {
    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps) {
        if (this.props.subject !== prevProps.subject) {
            this.load();
        }
    }

    load() {
        if (this.props.subject) {
            this.props.fetchMetadataVocabularyIfNeeded();
            this.props.fetchMetadataBySubjectIfNeeded(this.props.subject);
        }
    }

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
                        />
                    ))
                }
            </List>
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
    fetchMetadataVocabularyIfNeeded,
    fetchMetadataBySubjectIfNeeded
}

export default connect(mapStateToProps, mapDispatchToProps)(MetadataEntityContainer);
