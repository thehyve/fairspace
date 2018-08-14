import React from 'react';
import 'font-awesome/css/font-awesome.min.css';

import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Icon from "@material-ui/core/Icon";
import {withRouter} from "react-router-dom";
import BreadCrumbs from "./BreadCrumbs";

class FileBrowser extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;

        // Initialize state
        let path = this.getPath(props.path);
        this.state = {
            path: path,
            contents: []
        };
    }

    componentDidMount() {
        this.loadContents(this.state.path);
    }

    loadContents(path) {
        const pathId = this.getPathId(path)

        this.setState({loading: true});
        fetch('http://localhost:3020/files/' + pathId + '/children')
            .then(data => data.json())
            .then(json => this.setState({loading: false, contents: json.items}))
    }

    componentWillReceiveProps(nextProps) {
        let path = this.getPath(nextProps.path);
        console.log("WillReceiveProps", nextProps, path);
        this.setState({
            path: path,
            contents: []
        });
        this.loadContents(path);
    }

    // Parse path into array
    getPath(path) {
        return path ? path.split('/') : [];
    }

    getPathId(path) {
        return btoa('/' + path.join('/')).replace(/=/g, '');
    }

    render() {
        if(this.state.loading) {
            return (<div>Loading...</div>);
        }

        return (
            <div>
                <BreadCrumbs segments={this.state.path} />

                {this.state.contents != null && this.state.contents[0] != null ?
                    (<Table>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell numeric>size</TableCell>
                                <TableCell numeric>Last Modified</TableCell>
                            </TableRow>
                        </TableHead>
                            <TableBody>
                                {this.state.contents.map(row => {
                                    return (
                                        <TableRow key={row.id} onClick={() => this.handleClickRow(row)}>
                                            <TableCell>
                                                <Icon>{row.type === 'dir' ? 'folder_open' : 'note_open'}</Icon>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {row.name}
                                            </TableCell>
                                            <TableCell numeric>{row.size}</TableCell>
                                            <TableCell numeric>{row.modifiedTime}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                    </Table>)
                    : ''}
            </div>
        );
    }

    handleClickRow(row) {
        if(row.type === 'dir') {
            this.props.history.push('/files' + atob(row.id));
        }
    }
}

export default withRouter(FileBrowser);
