import React from 'react';
import MetadataViewer from "./MetadataViewer";
import ErrorMessage from "../error/ErrorMessage";
import {fetchCombinedMetadataIfNeeded} from "../../actions/metadata";
import {connect} from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';

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
            dispatch(fetchCombinedMetadataIfNeeded(subject))
        }
    }

    render() {
        // putting dispatch here to avoid it being passed down to children
        const {subject, metadata, error, loading, editable, dispatch, ...otherProps} = this.props;

        if (error) {
            return (<ErrorMessage message="An error occurred while loading metadata"/>)
        } else if (loading) {
            return <CircularProgress/>;
        } else if (!metadata || metadata.length === 0) {
            return (<div>No metadata found</div>)
        } else {
            return (<MetadataViewer {...otherProps}
                                    editable={editable}
                                    subject={subject}
                                    properties={metadata}/>)
        }
    }
}

const mapStateToProps = (state, ownProps) => {
    const {metadataBySubject, cache: {vocabulary}} = state;
    const metadata = metadataBySubject[ownProps.subject];

    // If there is no metadata by subject (not even pending)
    // some error occurred.
    if (!metadata || !ownProps.subject) {
        return {
            error: true
        }
    }

    return {
        loading: metadata.pending || vocabulary.pending,
        error: metadata.error || vocabulary.error,
        metadata: metadata.data
    }
}

export default connect(mapStateToProps)(Metadata)
