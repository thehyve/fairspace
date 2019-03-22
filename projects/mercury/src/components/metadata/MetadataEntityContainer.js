import React from 'react';
import {connect} from 'react-redux';

import {ErrorMessage, LoadingInlay} from "../common";
import {fetchCombinedMetadataIfNeeded} from "../../actions/metadataActions";
import MetaEntity from "./MetaEntity";
import {isDateTimeProperty, propertiesToShow} from "../../utils/metadataUtils";

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
        const {dispatch, subject} = this.props;

        if (subject) {
            dispatch(fetchCombinedMetadataIfNeeded(subject));
        }
    }

    render() {
        const {subject, properties, error, loading, editable} = this.props;

        if (error) {
            return <ErrorMessage message={error.message} />;
        }

        if (loading) {
            return <LoadingInlay />;
        }

        if (!properties) {
            return null;
        }

        return <MetaEntity subject={subject} properties={properties} editable={editable} />;
    }
}

const mapStateToProps = (state, ownProps) => {
    const {metadataBySubject, cache: {vocabulary}} = state;
    const metadata = metadataBySubject[ownProps.subject];
    const hasNoSubject = !ownProps.subject;
    const hasNoMetadata = !metadata || !metadata.data || metadata.data.length === 0;
    const hasOtherErrors = (metadata && metadata.error) || !vocabulary || vocabulary.error;

    if (hasNoSubject || hasNoMetadata || hasOtherErrors) {
        const message = hasNoSubject || hasOtherErrors
            ? 'An error occurred while loading metadata.' : '(404) No such resource.';
        return {
            error: new Error(message)
        };
    }

    const properties = propertiesToShow(metadata.data)
        .map(p => ({
            ...p,
            editable: !isDateTimeProperty(p)
        }));

    return {
        loading: metadata.pending || vocabulary.pending,
        properties
    };
};

export default connect(mapStateToProps)(MetadataEntityContainer);
