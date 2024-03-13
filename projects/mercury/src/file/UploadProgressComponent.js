import React, {useContext, useState} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Collapse,
    IconButton,
    TableHead,
    Typography
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import {ExpandMore, FolderOpen, HighlightOffOutlined, NoteOutlined} from '@mui/icons-material';
import LinearProgress from '@mui/material/LinearProgress';
import classnames from 'classnames';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import UploadsContext, {
    UPLOAD_STATUS_ERROR,
    UPLOAD_STATUS_FINISHED,
    UPLOAD_STATUS_IN_PROGRESS,
    UPLOAD_STATUS_INITIAL
} from './UploadsContext';
import {splitPathIntoArray} from './fileUtils';
import {PATH_SEPARATOR} from '../constants';

const styles = theme => ({
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest
        })
    },
    expandOpen: {
        transform: 'rotate(180deg)'
    },
    wrapIcon: {
        verticalAlign: 'middle',
        display: 'inline-flex'
    }
});

export const UploadProgressComponent = ({classes}) => {
    const {uploads, removeUpload} = useContext(UploadsContext);
    const [expanded, setExpanded] = useState(true);

    if (!uploads || uploads.length === 0) {
        return null;
    }

    const toggleExpand = () => setExpanded(!expanded);

    const progress = upload => {
        switch (upload.status) {
            case UPLOAD_STATUS_INITIAL:
                return 'Upload pending';
            case UPLOAD_STATUS_IN_PROGRESS:
                return <LinearProgress variant="determinate" value={upload.progress} />;
            case UPLOAD_STATUS_FINISHED:
                return 'Finished';
            case UPLOAD_STATUS_ERROR:
                return (
                    <Typography variant="body2" color="error">
                        Error uploading
                    </Typography>
                );
            default:
                return '';
        }
    };

    const cardHeaderAction = (
        <IconButton
            onClick={toggleExpand}
            className={classnames(classes.expand, {
                [classes.expandOpen]: expanded
            })}
            aria-expanded={expanded}
            aria-label="Show more"
            size="medium"
        >
            <ExpandMore />
        </IconButton>
    );

    const renderFolderUploadName = (upload, folderName) => {
        const additionalFilesOrFolders = upload.files.filter(
            f => !f.path.startsWith(`${folderName}${PATH_SEPARATOR}`)
        );
        return (
            <Typography variant="body2" className={classes.wrapIcon} component="span">
                <FolderOpen fontSize="small" />
                &nbsp;{upload.destinationPath}/{folderName}
                {additionalFilesOrFolders.length > 0 && (
                    <em>&nbsp;and {additionalFilesOrFolders.length} other(s)</em>
                )}
            </Typography>
        );
    };

    const renderFileUploadName = upload => (
        <Typography variant="body2" className={classes.wrapIcon}>
            <NoteOutlined fontSize="small" />
            &nbsp;{upload.destinationPath}/{upload.files[0].path}
            {upload.files.length > 1 && <em>&nbsp;and {upload.files.length - 1} other(s)</em>}
        </Typography>
    );

    const renderUploadName = upload => {
        const folder = upload.files.find(f => splitPathIntoArray(f.path).length > 1);
        if (folder) {
            const folderName = splitPathIntoArray(folder.path)[0];
            return renderFolderUploadName(upload, folderName);
        }
        return renderFileUploadName(upload);
    };

    const renderUploadList = () => (
        <div style={{overflowX: 'auto'}}>
            {uploads.length > 0 && (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>File</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {uploads.map(upload => (
                            <TableRow key={upload.id}>
                                <TableCell>{renderUploadName(upload)}</TableCell>
                                <TableCell width={100}>{progress(upload)}</TableCell>
                                <TableCell width={40} padding="none">
                                    {upload.status === UPLOAD_STATUS_ERROR && (
                                        <IconButton
                                            aria-label="remove"
                                            onClick={() => removeUpload(upload)}
                                            size="medium"
                                        >
                                            <HighlightOffOutlined fontSize="small" />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );

    return (
        <Card>
            <CardHeader
                action={cardHeaderAction}
                titleTypographyProps={{variant: 'h6'}}
                title="Uploads"
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent style={{paddingTop: 0}}>{renderUploadList()}</CardContent>
            </Collapse>
        </Card>
    );
};

export default withStyles(styles)(UploadProgressComponent);
