import React from 'react';
import {
    Dialog, DialogTitle, DialogContent,
    DialogActions, Button, Icon, LinearProgress, Grid
} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles';
import Dropzone from 'react-dropzone';

const styles = {
    dropZone: {
        width: 400,
        height: 200,
        color: 'grey',
        padding: 20,
        backgroundColor: '#f8f8f8'
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
        const {filesUploaded, files} = this.state;

        if (!filesUploaded) {
            return (
                <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    spacing={8}
                >
                    <Grid item>
                        <Icon>cloud_upload</Icon>
                    </Grid>
                    <Grid item>
                        Drop files to current directory
                    </Grid>
                </Grid>
            );
        }

        return Object.keys(files)
            .map(fileName => (
                <Grid key={fileName} container spacing={8}>
                    <Grid item xs={6}>
                        {fileName}
                    </Grid>
                    <Grid item xs={6}>
                        {files[fileName] === 'uploading' ? <LinearProgress /> : 'Uploaded'}
                    </Grid>
                </Grid>
            ));
    }

    render() {
        const {children, classes} = this.props;
        const {uploading} = this.state;

        return (
            <>
                <span onClick={this.openDialog}>
                    {children}
                </span>

                <Dialog
                    open={uploading}
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
                                    className={classes.dropZone}
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
            </>
        );
    }
}

export default withStyles(styles)(UploadButton);
