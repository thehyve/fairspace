import React from 'react';
import {connect} from 'react-redux';
import MetadataViewer from "./MetadataViewer";
import ErrorMessage from "../common/ErrorMessage";
import LoadingInlay from '../common/LoadingInlay';
import {fetchCombinedMetadataIfNeeded} from "../../actions/metadataActions";

export class Metadata extends React.Component {
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
        // putting dispatch here to avoid it being passed down to children
        const {
            subject, metadata, error, loading, editable, dispatch, ...otherProps
        } = this.props;

        if (error) {
            return <ErrorMessage message={error.message} />;
        } if (loading) {
            return <LoadingInlay />;
        }

        return (
            <MetadataViewer
                {...otherProps}
                editable={editable}
                subject={subject}
                properties={metadata}
            />
        );
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

    return {
        loading: metadata.pending || vocabulary.pending,
        metadata: metadata.data
    };
};

export default connect(mapStateToProps)(Metadata);
