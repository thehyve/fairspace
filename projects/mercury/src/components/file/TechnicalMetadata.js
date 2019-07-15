import React from "react";
import PropTypes from "prop-types";
import {Table, TableBody, TableCell, TableRow} from "@material-ui/core";
import filesize from "filesize";
import DateTime from "../common/DateTime";

const TechnicalMetadata = ({fileProps}) => (
    <Table>
        <TableBody>
            {fileProps.dateCreated || fileProps.createdBy ? (
                <TableRow>
                    <TableCell>Created</TableCell>
                    <TableCell><DateTime value={fileProps.dateCreated} />{fileProps.createdBy ? ' by ' + fileProps.createdBy : ''}</TableCell>
                </TableRow>
            ) : undefined }
            {fileProps.dateModified || fileProps.modifiedBy ? (
                <TableRow>
                    <TableCell>Last modified</TableCell>
                    <TableCell><DateTime value={fileProps.dateModified} />{fileProps.modifiedBy ? ' by ' + fileProps.modifiedBy : ''}</TableCell>
                </TableRow>
            ) : undefined }
            {fileProps.fileSize ? (
                <TableRow>
                    <TableCell>Filesize</TableCell>
                    <TableCell>{filesize(fileProps.fileSize)}</TableCell>
                </TableRow>
            ) : undefined }
            {fileProps.checksum ? (
                <TableRow>
                    <TableCell>Checksum</TableCell>
                    <TableCell>{fileProps.checksum}</TableCell>
                </TableRow>
            ) : undefined }
            {fileProps.ownedBy ? (
                <TableRow>
                    <TableCell>Owner</TableCell>
                    <TableCell>{fileProps.ownedBy}</TableCell>
                </TableRow>
            ) : undefined }
        </TableBody>
    </Table>
);

TechnicalMetadata.propTypes = {
    fileProps: PropTypes.shape({
        dateCreated: PropTypes.string,
        createdBy: PropTypes.string,
        dateModified: PropTypes.string,
        modifiedBy: PropTypes.string,
        ownedBy: PropTypes.string,
        fileSize: PropTypes.number,
        checksum: PropTypes.string
    })
}

export default TechnicalMetadata;
