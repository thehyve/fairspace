import React from 'react';
import Typography from "@material-ui/core/Typography";
import {Actions, Grid, Store} from 'react-redux-grid';
import {Provider} from 'react-redux';
import 'font-awesome/css/font-awesome.min.css';
import {faFolder, faFile} from '@fortawesome/free-regular-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import Icon from "@material-ui/core/Icon/Icon";
import Dropzone from 'react-dropzone';
import {Column, Row} from 'simple-flexbox';

class DirectoryBrowser extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.s3Client = props.s3;


        // Initialize state
        this.state = {
            collection: props.collection,
            selectedRow: null
        };
    }

    gridPlugins = {
        GRID_ACTIONS: {
            onMenuShow: ({columns, rowData}) => {
                if (rowData) {
                    this.setState({selectedRow: rowData})
                }
                return (rowData && rowData.isDirectory) ? [] : ['menu-item-upload-file', 'menu-item-create-directory'];
            },
            menu: [
                {
                    text: 'Create Folder',
                    key: 'menu-item-create-directory',
                    EVENT_HANDLER: () => this.createDirectory()
                },
                {
                    text: 'Upload File',
                    key: 'menu-item-upload-file',
                    EVENT_HANDLER: () => this.inputOpenFileRef.current.click()

                }
            ]
        },
        LOADER: {
            enabled: true
        },
        ERROR_HANDLER: {
            defaultErrorMessage: 'Error while loading collections',
            enabled: true
        }
    };

    gridColumns = [
        {
            dataIndex: 'name', name: 'Name', expandable: true, width: '60%', renderer: ({column, value, row}) =>
                (<span><FontAwesomeIcon icon={row.isDirectory ? faFolder : faFile}/> {value}</span>)
        },
        {dataIndex: 'displayType', name: 'Type', expandable: false, width: '10%'},
        {dataIndex: 'size', name: 'Size', expandable: false, width: '15%'},
        {dataIndex: 'lastModified', name: 'Modified', expandable: false, width: '15%'}
    ];

    inputOpenFileRef = React.createRef();

    loadContents() {
        return this.s3Client.listObjects({Bucket: this.props.collection.id})
            .promise()
            .then(response => this.buildDirectoryTree(response.Contents))
            .catch(err => Store.dispatch(
                Actions.ErrorHandlerActions.setError({
                    stateKey: 'error',
                    error: err.toString()
                })))
    }

    buildDirectoryTree(objects) {
        const root = {id: 0, parentId: -1, children: [], name: '/', path: '/', isDirectory: true};
        const directories = {'': root};
        let id = 1;

        objects.forEach(obj => {
            let parts = obj.Key.split('/');
            let path = '';
            let parent = root;

            for (let i = 0; i < parts.length - 1; i++) {
                path = path + (path === '' ? '' : '/') + parts[i];
                if (!directories.hasOwnProperty(path)) {
                    const dir = {
                        id: id++,
                        parentId: parent.id,
                        name: parts[i],
                        path: path,
                        isDirectory: true,
                        children: []
                    };
                    directories[path] = dir;
                    parent.children.push(dir);
                    parent = dir;
                } else {
                    parent = directories[path]
                }
            }

            let fileName = parts[parts.length - 1];
            if (fileName !== '.ignore') {
                let ext = "";
                const dotPos = fileName.lastIndexOf(".");
                if (dotPos > 0) {
                    ext = fileName.slice(dotPos + 1);
                    fileName = fileName.slice(0, dotPos);
                }

                const fileInfo = {
                    id: id++,
                    parentId: parent.id,
                    name: fileName,
                    extension: ext,
                    displayType: ext,
                    isDirectory: false,
                    path: obj.Key,
                    lastModified: obj.LastModified.toLocaleString(),
                    size: obj.Size,
                    object: obj
                };
                parent.children.push(fileInfo);
            }
        });

        return {data: {root: {id: -1, parentId: null, children: [root]}}}
    }

    reloadContents() {
        Store.dispatch(
            Actions.GridActions.getAsyncData({
                showTreeRootNode: false,
                stateKey: 'tree-grid-files',
                dataSource: this.loadContents.bind(this),
                type: "tree"
            }))
    }


    createDirectory() {
        const name = prompt("Folder name", "");

        if (name) {
            const dest = this.state.selectedRow;
            const directory = dest.path;
            this.s3Client.putObject( // the only way to create a directory
                {
                    Bucket: this.props.collection,
                    Key: directory + (directory === '' ? '' : '/') + name + '/.ignore',
                    Body: ''
                },
                (err, data) => {
                    if (err) console.log(err, err.stack);
                    else console.log('Successfully created directory ' + name);
                    this.reloadContents();
                });
        }
    }

    onRowClick({row}, event) {
        this.setState({selectedRow: row})
    }

    onFileToUploadSelected(event) {
        this.uploadFiles(event.target.files);
    }

    uploadFiles(files) {
        const directory = this.currentDirectory();
        const promises = new Array(files.length)
            .map((x, i) => files[i])
            .map(file =>
                this.s3Client.putObject(
                    {
                        Bucket: this.props.collection,
                        Key: (directory === '/' ? '' : (directory + '/')) + file.name,
                        ContentType: file.type,
                        Body: file
                    }).promise());

        Promise.all(promises)
            .then(result => {
                console.log('Successfully uploaded files');
                this.reloadContents();
            })
            .catch(err => console.log(err, err.stack));
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({collection: nextProps.collection});
        this.reloadContents();
    }

    currentDirectory() {
        if (this.state.selectedRow) {
            if (this.state.selectedRow.isDirectory) {
                return this.state.selectedRow.path;
            } else {
                const path = this.state.selectedRow.path;
                if (path.includes('/')) {
                    return path.slice(0, path.lastIndexOf('/'));
                }
            }
        }
        return "/"
    }

    render() {
        return (
            <div>
                <Row>
                    <Column flexGrow={1} vertical={'center'}>
                        <Typography variant="title" paragraph={true}
                                    noWrap>{this.state.collection.name}</Typography>
                    </Column>
                    <Column>
                        <Dropzone onDrop={this.uploadFiles.bind(this)}
                                  style={{border: '0px', width: '100%', color: 'grey', padding: 20}}>
                            <Column horizontal={'center'}>
                                <Icon>cloud_upload</Icon>
                                <Typography paragraph={true}
                                            noWrap>{'Upload files to ' + this.currentDirectory()}</Typography>
                            </Column>
                        </Dropzone>
                    </Column>
                </Row>


                <Provider store={Store}>
                    <Grid
                        dataSource={this.loadContents.bind(this)}
                        stateKey="tree-grid-files"
                        gridType={"tree"}
                        showTreeRootNode={false}
                        stateful={false}
                        plugins={this.gridPlugins}
                        columns={this.gridColumns}
                        events={{
                            HANDLE_ROW_CLICK: this.onRowClick.bind(this),
                        }}
                    />
                </Provider>

                <input style={{display: "none"}}
                       ref={this.inputOpenFileRef}
                       type="file"
                       multiple={true}
                       onChange={this.onFileToUploadSelected.bind(this)}/>
            </div>
        );
    }
}

export default (DirectoryBrowser);
