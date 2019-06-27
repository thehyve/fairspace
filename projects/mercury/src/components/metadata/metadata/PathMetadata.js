import {connect} from 'react-redux';
import React from "react";
import MessageDisplay from "../../common/MessageDisplay";
import LinkedDataEntityFormContainer from "../common/LinkedDataEntityFormContainer";
import {statFile} from "../../../actions/fileActions";

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
            subject, error, loading, ...otherProps
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
                formKey={subject}
                {...otherProps}
            />
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const subjectByPath = {...state.cache.subjectByPath};
    const subject = subjectByPath && subjectByPath[ownProps.path];

    // If there is no subject by path (not even pending)
    // some error occurred.
    if (!subject) {
        return {};
    }

    return {
        loading: subject.pending,
        error: subject.error,
        subject: subject.data
    };
};

export default connect(mapStateToProps)(PathMetadata);
