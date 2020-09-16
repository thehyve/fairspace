import React, {useContext, useState} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Collapse,
    IconButton,
    TableHead,
    Typography,
    withStyles
} from "@material-ui/core";
import {ExpandMore, HighlightOffOutlined} from "@material-ui/icons";
import LinearProgress from "@material-ui/core/LinearProgress";
import classnames from "classnames";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import UploadsContext, {
    UPLOAD_STATUS_ERROR,
    UPLOAD_STATUS_FINISHED,
    UPLOAD_STATUS_IN_PROGRESS,
    UPLOAD_STATUS_INITIAL
} from "./UploadsContext";

const styles = theme => ({
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
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
                return "Upload pending";
            case UPLOAD_STATUS_IN_PROGRESS:
                return <LinearProgress variant="determinate" value={upload.progress} />;
            case UPLOAD_STATUS_FINISHED:
                return "Finished";
            case UPLOAD_STATUS_ERROR:
                return <Typography variant="body2" color="error">Error uploading</Typography>;
            default:
                return "";
        }
    };

    const cardHeaderAction = (
        <IconButton
            onClick={toggleExpand}
            className={classnames(classes.expand, {
                [classes.expandOpen]: expanded,
            })}
            aria-expanded={expanded}
            aria-label="Show more"
        >
            <ExpandMore />
        </IconButton>
    );

    const renderUploadName = (upload) => (
        <span>
            {upload.destinationPath}/{upload.files[0].name}
            {upload.files.length > 1 && (
                <em> and {upload.files.length - 1} other(s)</em>
            )}
        </span>
    );

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
                                    { upload.status === UPLOAD_STATUS_ERROR
                                        && (
                                            <IconButton aria-label="remove" onClick={() => removeUpload(upload)}>
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
                <CardContent style={{paddingTop: 0}}>
                    {renderUploadList()}
                </CardContent>
            </Collapse>
        </Card>
    );
};

export default withStyles(styles)(UploadProgressComponent);
