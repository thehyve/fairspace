import React from 'react';
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Dropzone from 'react-dropzone';
import {Column} from "simple-flexbox";

class UploadButton extends React.Component{
    constructor(props) {
        super(props);
        const {
            onDidUpload,
            onUpload,
            children,
            ...componentProps
        } = props;

        this.onDidUpload = onDidUpload;
        this.onUpload = onUpload;
        this.componentProps = componentProps;

        this.state = {
            uploading: false,
            directory: '....'
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            uploading: false,
        });
    }

    openDialog() {
        this.filesUploaded = false;
        this.setState({uploading: true});
    }

    closeDialog() {
        if(this.filesUploaded && this.onDidUpload) {
            this.onDidUpload();
        }

        this.setState({uploading: false});
    }

    uploadFiles(files) {
        this.filesUploaded = true;
        if(this.onUpload) {
            this.onUpload(files);
        }
    }

    render() {
        return (
            <div>
                <IconButton {...this.componentProps} onClick={this.openDialog.bind(this)}>
                    {this.props.children}
                </IconButton>

                <Dialog
                    open={this.state.uploading}
                    onClose={this.closeDialog.bind(this)}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Upload files to: {this.state.directory}</DialogTitle>
                    <DialogContent>
                        <Dropzone
                            onDrop={this.uploadFiles.bind(this)}
                            style={{width:'auto', color: 'grey', padding: 80, backgroundColor: '#f8f8f8'}}>
                            <Column horizontal={'center'}>
                                <Icon>cloud_upload</Icon>
                                <Typography paragraph={true}
                                            noWrap>Drop files here to upload them to {this.state.directory}</Typography>
                            </Column>
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

export default UploadButton;




