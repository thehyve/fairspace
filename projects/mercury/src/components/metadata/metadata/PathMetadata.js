import {connect} from 'react-redux';
import React from "react";
import MessageDisplay from "../../common/MessageDisplay";
import LinkedDataEntityFormContainer from "../common/LinkedDataEntityFormContainer";
import {statFile} from "../../../actions/fileActions";
import {EXTERNAL_DIRECTORY_URI, EXTERNAL_FILE_URI} from "../../../constants";

export class PathMetadata extends React.Component {
    componentDidMount() {
        this.load();
    }


    load() {
        const {dispatch, path, subject} = this.props;

        if (!subject && path) {
            dispatch(statFile(path));
        }
    }

    render() {
        // putting dispatch here to avoid it being passed down to children
        const {
            subject, type, error, loading, ...otherProps
        } = this.props;

        if (error) {
            return (<MessageDisplay message="An error occurred while determining metadata subject" />);
        } if (loading) {
            return (<div>Loading...</div>);
        } if (!subject) {
            return (<div>No metadata found</div>);
        }
        return (
            <LinkedDataEntityFormContainer
                subject={subject}
                defaultType={type === 'directory' ? EXTERNAL_DIRECTORY_URI : EXTERNAL_FILE_URI}
                {...otherProps}
            />
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const fileInfoByPath = {...state.cache.fileInfoByPath};
    const subject = fileInfoByPath && fileInfoByPath[ownProps.path];

    // If there is no subject by path (not even pending)
    // some error occurred.
    if (!subject) {
        return {};
    }

    return {
        loading: subject.pending,
        error: subject.error,
        subject: subject.data && subject.data.props.iri,
        type: subject.data && subject.data.type
    };
};

export default connect(mapStateToProps)(PathMetadata);
