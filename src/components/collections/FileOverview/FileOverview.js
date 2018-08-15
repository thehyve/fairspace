import React from 'react';
import FileList from "../FileList/FileList";

class FileOverview extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.prefix = props.prefix;

        // Initialize state
        let path = this.getPath(props.path);
        this.state = {
            loading: false,
            path: path,
            contents: [],
            selectedPath: props.selectedPath
        };
    }

    componentDidMount() {
        this.loadContents(this.state.path);
    }

    loadContents(path) {
        const pathId = this.getPathId(path)

        this.setState({loading: true});
        fetch('/files/' + pathId + '/children')
            .then(data => data.json())
            .then(json => this.setState({loading: false, contents: json.items}))
            .catch(err => {
                this.setState({loading: false, error: true});
            })
    }

    componentWillReceiveProps(nextProps) {
        // See if we need updating
        if(nextProps.path !== this.props.path) {
            let path = this.getPath(nextProps.path);

            this.setState({
                path: path,
                contents: [],
                selectedPath: nextProps.selectedPath
            });
            this.loadContents(path);
        } else {
            this.setState({
                selectedPath: nextProps.selectedPath
            });
            this.props = nextProps;
        }
    }

    // Parse path into array
    getPath(path) {
        if(!path)
            return [];

        if(path[0] === '/')
            path = path.slice(1);

        return path ? path.split('/') : [];
    }

    getPathId(path) {
        const completePath = [this.prefix, ...path].join('/');
        return btoa(completePath).replace(/=/g, '');
    }

    render() {
        if(this.state.loading) {
            return (<div>Loading...</div>);
        }

        return (<FileList
                    files={this.state.contents}
                    selectedPath={this.state.selectedPath}
                    onPathClick={this.props.onPathClick}
                    onPathDoubleClick={this.props.onPathDoubleClick} />);
    }
}

export default FileOverview;
