import React from 'react';
import MetadataViewer from "./MetadataViewer";
import ErrorMessage from "../error/ErrorMessage";
import Typography from "@material-ui/core/Typography";
import {fetchMetadataBySubjectIfNeeded, fetchMetadataVocabularyIfNeeded} from "../../actions/metadata";
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
            dispatch(fetchMetadataBySubjectIfNeeded(subject))
            dispatch(fetchMetadataVocabularyIfNeeded())
        }
    }

    renderBody() {
        if (this.props.error) {
            return (<ErrorMessage message="An error occurred while loading metadata"/>)
        } else if (this.props.loading) {
            return (<div>Loading...</div>)
        } else if (!this.props.metadata || this.props.metadata.length === 0) {
            return (<div>No metadata found</div>)
        } else {
            const combinedProperties = this.props.vocabulary.combine(this.props.metadata)
            return (<MetadataViewer properties={combinedProperties}/>)
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
    const {metadataBySubject, vocabulary} = state.cache;
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
        metadata: metadata.items,
        vocabulary: vocabulary.item
    }
}

export default connect(mapStateToProps)(Metadata)
