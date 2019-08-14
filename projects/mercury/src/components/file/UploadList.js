import React from 'react';
import {Grid, Icon, LinearProgress, Paper, Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import Dropzone from "react-dropzone";

const UploadList = () => {
    const files = [
        {
            filename: 'abc.txt',
            collection: {
                iri: '',
                name: 'My collection',
                location: '/my-collection'
            },
            destinationPath: 'subdirectory',
            started: true,
            progress: 25
        },
        {
            filename: 'other-file.csv',
            collection: {
                iri: '',
                name: 'My collection',
                location: '/my-collection'
            },
            destinationPath: 'subdirectory',
            started: true,
            progress: 99
        }
    ];

    const uploadFiles = () => {};

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Filename</TableCell>
                        <TableCell>Destination</TableCell>
                        <TableCell>Progress</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {files.map(upload => (
                        <TableRow key={upload.filename}>
                            <TableCell>{upload.filename}</TableCell>
                            <TableCell>{upload.collection.name} / {upload.destinationPath}</TableCell>
                            <TableCell>{upload.started ? <LinearProgress variant="determinate" value={upload.progress} /> : 'Not started yet'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dropzone onDrop={uploadFiles}>
                {({getRootProps, getInputProps}) => (
                    <div
                        {...getRootProps()}
                    >
                        <input {...getInputProps()} />
                        <Grid
                            container
                            direction="column"
                            justify="center"
                            alignItems="center"
                            spacing={8}
                            style={{padding: 20}}
                        >
                            <Grid item>
                                <Icon>cloud_upload</Icon>
                            </Grid>
                            <Grid item>
                                Drop files to upload
                            </Grid>
                        </Grid>
                    </div>
                )}
            </Dropzone>
        </Paper>
    );
};

export default UploadList;
