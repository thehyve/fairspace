import React from 'react';
import {connect} from 'react-redux';
import List from '@material-ui/core/List';

import {ErrorMessage, LoadingInlay} from "../common";
import {fetchCombinedMetadataIfNeeded} from "../../actions/metadataActions";
import MetadataProperty from "./MetadataProperty";
import {isDateTimeProperty, propertiesToShow} from "../../utils/metadataUtils";

export class MetadataEntity extends React.Component {
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
        const {subject, metadata, error, loading, editable} = this.props;

        if (error) {
            return <ErrorMessage message={error.message} />;
        }

        if (loading) {
            return <LoadingInlay />;
        }

        if (!metadata) {
            return null;
        }

        return (
            <List dense>
                {
                    propertiesToShow(metadata)
                        .map((p) => (
                            <MetadataProperty
                                editable={editable && !isDateTimeProperty(p)}
                                subject={subject}
                                key={p.key}
                                property={p}
                            />
                        ))
                }
            </List>
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

export default connect(mapStateToProps)(MetadataEntity);
