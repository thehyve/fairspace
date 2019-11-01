import React from 'react';
import {
    Grid, Icon, LinearProgress, Paper, Table, TableBody, TableCell, TableHead, TablePagination, TableRow
} from "@material-ui/core";
import Dropzone from "react-dropzone";
import filesize from "filesize";
import {usePagination} from '@fairspace/shared-frontend';

import {
    UPLOAD_STATUS_ERROR, UPLOAD_STATUS_FINISHED, UPLOAD_STATUS_IN_PROGRESS, UPLOAD_STATUS_INITIAL
} from "../common/contexts/UploadsContext";


const progress = upload => {
    switch (upload.status) {
        case UPLOAD_STATUS_INITIAL:
            return "Upload pending";
        case UPLOAD_STATUS_IN_PROGRESS:
            return <LinearProgress variant="determinate" value={upload.progress} />;
        case UPLOAD_STATUS_FINISHED:
            return "Finished";
        case UPLOAD_STATUS_ERROR:
            return "Error uploading";
        default:
            return "";
    }
};

const UploadList = ({uploads, enqueue}) => {
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(uploads);

    return (
        <>
            <Paper style={{overflowX: 'auto'}}>
                {uploads.length > 0 && (
                    <>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Filename</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell>Progress</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pagedItems.map(upload => (
                                    <TableRow key={upload.destinationFilename}>
                                        <TableCell>
                                            {
                                                upload.file.name === upload.destinationFilename
                                                    ? upload.file.name
                                                    : (
                                                        <>
                                                            {upload.file.name} <em>renamed to {upload.destinationFilename}</em>
                                                        </>
                                                    )
                                            }
                                        </TableCell>
                                        <TableCell>{filesize(upload.file.size)}</TableCell>
                                        <TableCell>{progress(upload)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={uploads.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onChangePage={(e, p) => setPage(p)}
                            onChangeRowsPerPage={e => setRowsPerPage(e.target.value)}
                        />
                    </>
                )}
            </Paper>
            <Paper style={{marginTop: 20}}>
                <Dropzone onDrop={files => enqueue(files)}>
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
                                spacing={1}
                                style={{padding: 20, minHeight: 200}}
                            >
                                <Grid item>
                                    <Icon>cloud_upload</Icon>
                                </Grid>
                                <Grid item>
                                    Drop files or click here to upload
                                </Grid>
                            </Grid>
                        </div>
                    )}
                </Dropzone>
            </Paper>
        </>
    );
};

export default UploadList;
