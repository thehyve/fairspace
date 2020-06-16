import React, {useState} from 'react';
import {IconButton, Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import {SettingsBackupRestore} from "@material-ui/icons";
import useAsync from "../common/hooks/UseAsync";
import FileAPI from "./FileAPI";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import ConfirmationDialog from "../common/components/ConfirmationDialog";

const FileVersionsList = ({selectedFile, onRevertVersion}) => {
    const {data, error, loading} = useAsync(() => FileAPI.showFileHistory(selectedFile.filename));
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState();

    if (error) {
        return (<MessageDisplay message="An error occurred while reverting the file to a previous version" />);
    }
    if (loading) {
        return (<LoadingInlay />);
    }

    const handleRevertToVersion = (version) => {
        setSelectedVersion(version);
        setShowConfirmDialog(true);
    };

    const handleCloseConfirmDialog = () => {
        setShowConfirmDialog(false);
    };

    const renderConfirmationDialog = () => {
        if (!showConfirmDialog) {
            return null;
        }
        const content = `Are you sure you want to revert "${selectedFile.filename}" to version "${selectedVersion}"`;

        return (
            <ConfirmationDialog
                open
                title="Confirmation"
                content={content}
                dangerous
                agreeButtonText="Revert"
                onAgree={() => onRevertVersion(selectedVersion)}
                onDisagree={handleCloseConfirmDialog}
                onClose={handleCloseConfirmDialog}
            />
        );
    };

    return (
        <>
            {!data ? (
                <div>No previous version found.</div>
            ) : (
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="none">Version</TableCell>
                            <TableCell align="left">Last modified</TableCell>
                            <TableCell align="left">Size</TableCell>
                            <TableCell padding="none" align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((fileVersion) => (
                            <TableRow
                                hover
                                key={fileVersion.version}
                                onDoubleClick={() => handleRevertToVersion(fileVersion.version)}
                            >
                                <TableCell padding="none" align="left">
                                    {fileVersion.version}
                                </TableCell>
                                <TableCell align="left">
                                    {fileVersion.lastmod}
                                </TableCell>
                                <TableCell align="left">
                                    {fileVersion.size}
                                </TableCell>
                                <TableCell padding="none" align="right">
                                    <IconButton
                                        aria-label="Revert to this version"
                                        title="Revert to this version"
                                        onClick={() => handleRevertToVersion(fileVersion.version)}
                                    >
                                        <SettingsBackupRestore />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            )}
            {renderConfirmationDialog()}
            {/* TODO: pagination */}
        </>
    );
};

export default FileVersionsList;
