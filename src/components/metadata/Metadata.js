import React from 'react';
import MetadataViewer from "./MetadataViewer";
import ErrorMessage from "../error/ErrorMessage";
import {fetchCombinedMetadataIfNeeded} from "../../actions/metadata";
import {connect} from 'react-redux'
import permissionAPI from "../../services/PermissionAPI/PermissionAPI";
import ErrorDialog from "../error/ErrorDialog";

export class Metadata extends React.Component {
    state = {
        editable: true
    }

    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps) {
        if(this.props.subject !== prevProps.subject) {
            this.load();
        }
    }

    load() {
        const {collection, dispatch, subject} = this.props;

        if(subject) {
            dispatch(fetchCombinedMetadataIfNeeded(subject))
        }

        if(collection) {
            permissionAPI
                .getCollectionPermissions(collection.id)
                .then(result => {
                    const permissions = result.filter(item => item.subject !== collection.creator);
                    const editable = permissions.some(p => {
                        return p.access === 'Write' || p.access === 'Manage';
                    });
                    this.setState({
                        editable: editable
                    });
                })
                .catch(error => {
                    ErrorDialog.showError(error, 'An error occurred while loading permissions.');
                });
        }
    }

    render() {
        const {subject, metadata, error, loading, dispatch, ...otherProps} = this.props;

        if (error) {
            return (<ErrorMessage message="An error occurred while loading metadata"/>)
        } else if (loading) {
            return (<div>Loading...</div>)
        } else if (!metadata || metadata.length === 0) {
            return (<div>No metadata found</div>)
        } else {
            return (<MetadataViewer {...otherProps}
                                    editable={false}
                                    subject={subject}
                                    properties={metadata}/>)
        }
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
        metadata: metadata.data
    }
}

export default connect(mapStateToProps)(Metadata)
