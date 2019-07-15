import React from "react";
import MessageDisplay from "../../common/MessageDisplay";
import LinkedDataEntityFormContainer from "../common/LinkedDataEntityFormContainer";
import {EXTERNAL_DIRECTORY_URI, EXTERNAL_FILE_URI} from "../../../constants";
import FileAPI from "../../../services/FileAPI";

export class PathMetadata extends React.Component {
    constructor(props) {
        super(props);

        this.state = {loading: true};
    }

    componentDidMount() {
        this.load();
    }

    load() {
        FileAPI.stat(this.props.path)
            .then(stat => this.setState({loading: false, stat}))
            .catch(error => this.setState({loading: false, error}));
    }

    render() {
        const {loading, error, stat} = this.state;

        if (loading) {
            return (<div>Loading...</div>);
        }
        if (error) {
            return (<MessageDisplay message="An error occurred while determining metadata subject" />);
        }
        if (!(stat && stat.props && stat.props.iri)) {
            return (<div>No metadata found</div>);
        }
        return (
            <LinkedDataEntityFormContainer
                subject={stat.props.iri}
                defaultType={stat.type === 'directory' ? EXTERNAL_DIRECTORY_URI : EXTERNAL_FILE_URI}
                {...this.props}
            />
        );
    }
}

export default PathMetadata;
