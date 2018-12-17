import React from 'react';
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import LinearProgress from "@material-ui/core/LinearProgress";
import {withStyles} from '@material-ui/core/styles';
import Dropzone from 'react-dropzone';
import {Column} from "simple-flexbox";

const styles = {
    dropZone: {
        width: 400,
        height: 200,
        color: 'grey',
        padding: 20,
        backgroundColor: '#f8f8f8'
    },
    progressFilename: {
        width: 200,
        span: {
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            whiteSpace: 'nowrap'
        }
    }
};

class UploadButton extends React.Component {
    constructor(props) {
        super(props);
        const {
            onDidUpload,
            onUpload,
            children,
            classes,
            ...componentProps
        } = props;

        this.onDidUpload = onDidUpload;
        this.onUpload = onUpload;
        this.componentProps = componentProps;

        this.state = {
            uploading: false,
            files: {}
        };
    }

    componentWillReceiveProps(props) {
        this.onDidUpload = props.onDidUpload;
        this.onUpload = props.onUpload;

        this.setState({
            uploading: false,
            files: {}
        });
    }

    openDialog(e) {
        e.stopPropagation();
        this.filesUploaded = false;
        this.setState({uploading: true});
    }

    closeDialog(e) {
        if (e) e.stopPropagation();
        if (this.filesUploaded && this.onDidUpload) {
            this.onDidUpload();
        }

        this.setState({
            uploading: false,
            files: {}
        });
    }

    uploadFiles(files, names) {
        this.filesUploaded = true;
        if (this.onUpload) {
            this.startUploading(files);
            this.onUpload(files, names)
                .then(this.finishUploading.bind(this));
        }
    }

    startUploading(files) {
        this.setFilesState(files, 'uploading');
    }

    finishUploading(files) {
        this.setFilesState(files, 'uploaded');
    }

    setFilesState(files, state) {
        // Add these file to a copy of the current map with files
        const filesMap = Object.assign({}, this.state.files);
        files.forEach((file) => { filesMap[file.name] = state; });

        // Set the new state
        this.setState({files: filesMap});
    }

    renderDropzoneContent() {
        if (!this.filesUploaded) {
            return (
                <Column horizontal="center">
                    <Icon>cloud_upload</Icon>
                    <Typography
                        paragraph
                        noWrap
                    >
Drop files here to upload them to the current directory
                    </Typography>
                </Column>
            );
        }
        return (
            <table width="100%">
                <tbody>
                    {Object.keys(this.state.files).map(filename => (
                        <tr key={filename}>
                            <td className={this.props.classes.progressFilename}>
                                <span>
                                    {filename}
                                </span>
                            </td>
                            <td>{this.state.files[filename] === 'uploading' ? <LinearProgress /> : 'Uploaded'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    render() {
        return (
            <div style={{display: 'inline'}}>
                <IconButton {...this.componentProps} onClick={this.openDialog.bind(this)}>
                    {this.props.children}
                </IconButton>

                <Dialog
                    open={this.state.uploading}
                    onClick={e => e.stopPropagation()}
                    onClose={this.closeDialog.bind(this)}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Upload files</DialogTitle>
                    <DialogContent>
                        <Dropzone
                            onDrop={this.uploadFiles.bind(this)}
                            className={this.props.classes.dropZone}
                        >

                            {this.renderDropzoneContent()}
                        </Dropzone>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeDialog.bind(this)} color="secondary">

                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default withStyles(styles)(UploadButton);
