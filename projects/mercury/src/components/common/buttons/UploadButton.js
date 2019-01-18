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
    state = {
        uploading: false,
        filesUploaded: false,
        files: {}
    };

    openDialog = (e) => {
        e.stopPropagation();
        this.setState({uploading: true, filesUploaded: false});
    }

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        if (this.state.filesUploaded && this.props.onDidUpload) {
            this.props.onDidUpload();
        }

        this.setState({
            uploading: false,
            files: {}
        });
    }

    uploadFiles = (files, names) => {
        if (this.props.onUpload) {
            this.setFilesState(files, 'uploading');
            this.props.onUpload(files, names)
                .then(() => this.setFilesState(files, 'uploaded'));
        }
    }

    setFilesState(files, fileState) {
        this.setState(prevState => {
            // Add these file to a copy of the current map with files
            const filesMap = {...prevState.files};
            files.forEach((file) => {filesMap[file.name] = fileState;});
            return {files: filesMap, filesUploaded: true};
        });
    }

    renderDropzoneContent() {
        if (!this.state.filesUploaded) {
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
                    {Object.keys(this.state.files)
                        .map(filename => (
                            <tr key={filename}>
                                <td className={this.props.classes.progressFilename}>
                                    <span>
                                        {filename}
                                    </span>
                                </td>
                                <td>
                                    {this.state.files[filename] === 'uploading' ? <LinearProgress /> : 'Uploaded'}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        );
    }

    render = () => (
        <div style={{display: 'inline'}}>
            <IconButton {...this.state.componentProps} onClick={this.openDialog}>
                {this.props.children}
            </IconButton>

            <Dialog
                open={this.state.uploading}
                onClick={e => e.stopPropagation()}
                onClose={this.closeDialog}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Upload files</DialogTitle>
                <DialogContent>
                    <Dropzone
                        onDrop={this.uploadFiles}
                    >
                        {({getRootProps, getInputProps}) => (
                            <div
                                {...getRootProps()}
                                className={this.props.classes.dropZone}
                            >
                                <input {...getInputProps()} />
                                {
                                    this.renderDropzoneContent()
                                }
                            </div>
                        )}
                    </Dropzone>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.closeDialog}
                        color="secondary"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default withStyles(styles)(UploadButton);
