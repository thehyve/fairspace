import React from 'react';
import {
    Grid, Icon, LinearProgress, Paper, Table, TableBody, TableCell, TableHead, TablePagination, TableRow
} from "@material-ui/core";
import Dropzone from "react-dropzone";
import filesize from "filesize";
import {UPLOAD_STATUS_IN_PROGRESS} from "../../reducers/uploadsReducers";
import usePagination from "../common/usePagination";

const UploadList = ({uploads, enqueue}) => {
    const {page, setPage, rowsPerPage, setRowsPerPage, pagedItems} = usePagination(uploads);

    return (
        <Paper>
            {uploads.length > 0
                ? (
                    <>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Filename</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell>Status</TableCell>
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
                                        <TableCell>{upload.status}</TableCell>
                                        <TableCell>{upload.status === UPLOAD_STATUS_IN_PROGRESS ? (
                                            <LinearProgress
                                                variant="determinate"
                                                value={upload.progress}
                                            />
                                        ) : ''}
                                        </TableCell>
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
                )
                : undefined
            }
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
