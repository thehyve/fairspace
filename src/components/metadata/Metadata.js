import React from 'react';
import MetadataViewer from "./MetadataViewer";
import ErrorMessage from "../error/ErrorMessage";
import Typography from "@material-ui/core/Typography";
import {fetchCombinedMetadataIfNeeded} from "../../actions/metadata";
import {connect} from 'react-redux'

export class Metadata extends React.Component {
    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps) {
        if(this.props.subject !== prevProps.subject) {
            this.load();
        }
    }

    load() {
        const {dispatch, subject} = this.props;

        if(subject) {
            dispatch(fetchCombinedMetadataIfNeeded(subject))
        }
    }

    renderBody() {
        const {subject, metadata, error, loading} = this.props;

        if (error) {
            return (<ErrorMessage message="An error occurred while loading metadata"/>)
        } else if (loading) {
            return (<div>Loading...</div>)
        } else if (!metadata || metadata.length === 0) {
            return (<div>No metadata found</div>)
        } else {
            return (<MetadataViewer subject={subject} properties={metadata}/>)
        }
    }

    render() {
        return (
            <div>
                <Typography variant="subheading">Metadata:</Typography>
                {this.renderBody()}
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    const {metadataBySubject, cache: { vocabulary }} = state;
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
        metadata: metadata.items
    }
}

export default connect(mapStateToProps)(Metadata)
